import { deepCopy, deepEquals, entriesOf, simpleStarMatch, toBatches, UnknownError, withTimeout } from "@rickosborne/foundation";
import { assertJSONSerializable, hasNumber, hasOwn, hasString, isInt, isJSONArray, isJSONSerializable, isPromiseLike, validateJSONArray, ValidationError } from "@rickosborne/guard";
import type { AnyFunction, JSONArray, JSONObject, JSONSerializable } from "@rickosborne/typical";
import * as jsonataModule from "jsonata";
import * as jsonpath from "jsonpath";
import { assignJSONPath } from "./assign-json-path.js";
import { evaluateIntrinsicFunction } from "./intrinsic-function.js";
import { QueryEvaluationError } from "./query-evaluation-error.js";
import {
	type AssignedState,
	type ChoiceRule,
	type DataTestExpressions,
	type ErrorOutput,
	errorOutputFromError,
	hasQueryLanguage,
	hasTimeouts,
	type HasTimeoutsState,
	isAndExpression,
	isArgumentsState,
	isAssignedState,
	isCatchState,
	isDataTestExpression,
	isDataTestLiteralExpressionKey,
	isEndState,
	isInputPathState,
	isIsoDateTime,
	isJSONataChoiceRule,
	isJSONataItemBatcher,
	isJSONataItemReader,
	isJSONataString,
	isJSONPathInterpolated,
	isJSONPathItemBatcher,
	isJSONPathItemReader,
	isJSONPathPath,
	isJSONPathPayloadTemplate,
	isNonTerminalState,
	isNotExpression,
	isOrExpression,
	isOutputPathState,
	isOutputState,
	isParametersState,
	isResultPathState,
	isResultSelectorState,
	isRetryState,
	isSucceedState,
	JSONATA,
	type JSONataCatcher,
	type JSONataString,
	JSONPATH,
	type JSONPathCatcher,
	type JSONPathChoiceRule,
	type JSONPathPath,
	type MapState,
	type ParallelBranch,
	type QueryLanguageIdentifier,
	type ResourceURI,
	type ResultWriter,
	type Retrier,
	type State,
	type StateMachine,
	STATES_ALL,
	STATES_BRANCH_FAILED,
	STATES_EXCEED_TOLERATED_FAILURE_THRESHOLD, STATES_HEARTBEAT_TIMEOUT,
	STATES_NO_CHOICE_MATCHED, STATES_PERMISSIONS,
	STATES_RESULT_WRITER_FAILED,
	STATES_TASK_FAILED,
	STATES_TIMEOUT,
	type StepIdentifier,
	type TaskState,
	toDataTestLiteralExpressionKey,
} from "./sfn-types.js";
import { StatesError } from "./states-error.js";

const jsonata = (jsonataModule as unknown as { default: typeof jsonataModule }).default;

export type ResourceHandlerResolver = ((resourceUri: ResourceURI) => AnyFunction);

export interface RunLocalOptions {
	contextObject?: JSONObject;
	fnForResource?: Record<ResourceURI, AnyFunction> | ResourceHandlerResolver;
	input?: JSONSerializable;
	language?: QueryLanguageIdentifier;
	nowProvider?: () => number;
	/**
	 * Simulate a Task passing or failing a credentials check. Return `true` to
	 * proceed as normal, or `false` to force a `States.Permissions` failure.
	 */
	onCredentials?: (credentials: JSONObject, stateName: StepIdentifier) => boolean;
	/**
	 * Simulate a Task passing or failing a heartbeat check. Return `true` to
	 * proceed as normal, or `false` to force a `States.HeartbeatTimeout` failure.
	 */
	onHeartbeatSeconds?: (seconds: number, stateName: StepIdentifier) => boolean;
	onMaxInputBytesPerBatch?: (items: JSONArray, maxInputBytesPerBatch: number, stateName: StepIdentifier) => JSONArray;
	/**
	 * Called when evaluating whether to retry a failure.
	 * Since this implementation won't actually delay, you will need
	 * to work out your own `sleep` equivalent to add the delay here.
	 * The `retryCount` value here starts at `0` to indicate that
	 * one failure has occurred, but zero retries have been attempted.
	 */
	onRetry?: (stateName: string, retrier: Retrier, retryCount: number, errorOutput: ErrorOutput, wouldRetry: boolean) => Promise<boolean | undefined>;
	onStepComplete?: (finished: Readonly<{
		readonly stateName: StepIdentifier;
		readonly state: Readonly<State>;
		readonly input: Readonly<JSONSerializable>;
		readonly output: Readonly<JSONSerializable>;
		readonly stateStack: Readonly<Readonly<State>[]>;
	}>) => void;
	onWait?: (until: Date, seconds?: number | undefined) => Promise<void>;
}

type TimedWrapper<T> = (promise: Promise<T>) => Promise<T>;

interface AssignThenContinue {
	error?: Error | undefined;
	errorOutput: ErrorOutput | undefined;
	evalOutput?: boolean | undefined;
	input: JSONSerializable;
	nextStateName?: StepIdentifier | undefined;
	output: JSONSerializable;
	retryCount: number;
	state: State;
	stateName: StepIdentifier;
	stateStack: State[];
}

interface EvaluationAssertion<T extends JSONSerializable> {
	expected: string;
	fieldName: string;
	predicate: (value: JSONSerializable) => value is T;
	stateName: StepIdentifier;
}

export const runLocal = async (
	stateMachine: StateMachine,
	options: RunLocalOptions = {},
): Promise<JSONSerializable> => {
	let fnResolver: ResourceHandlerResolver;
	if (typeof options.fnForResource === "function") {
		fnResolver = options.fnForResource;
	} else {
		const resourceFns = options.fnForResource ?? {};
		fnResolver = (resourceUri: ResourceURI) => {
			const fn = resourceFns[ resourceUri ];
			if (fn == null) {
				throw new Error(`No function found for resource: ${ resourceUri }`);
			}
			return fn;
		};
	}
	const evaluateJSONata = async <T extends JSONSerializable>(
		text: JSONataString,
		context: {
			contextObject?: JSONObject;
			input: JSONSerializable;
			output?: JSONSerializable | undefined;
			errorOutput?: ErrorOutput | undefined;
			state: State,
		},
		assertion?: EvaluationAssertion<T>,
	): Promise<T> => {
		const expressionText = text.substring(2, text.length - 2).trim();
		const expression = jsonata(expressionText);
		const bindings = {
			...(typeof context.input === "object" ? context.input : {}),
			...(typeof context.output === "object" ? context.output : {}),
			states: {
				context: context.contextObject ?? {},
				input: context.input,
				...(context.errorOutput == null ? {} : { errorOutput: context.errorOutput }),
				...(context.output == null ? {} : { result: context.output }),
			},
		};
		const value: unknown = await expression.evaluate(context.input, bindings);
		if (!isJSONSerializable(value)) {
			throw new QueryEvaluationError(expressionText);
		}
		assertJSONSerializable(value);
		if (assertion != null && !assertion.predicate(value)) {
			throw new SyntaxError(`${context.state.Type} state ${assertion.stateName} ${assertion.fieldName} JSONata expression must resolve to ${assertion.expected}`);
		}
		return value as T;
	};
	const runAssign = async (
		context: {
			assigned: AssignedState;
			catcher?: JSONataCatcher | JSONPathCatcher | undefined;
			input: JSONSerializable;
			output: JSONSerializable;
			state: State;
			stateStack: State[];
		},
	): Promise<JSONSerializable> => {
		const { assigned, state, output, stateStack } = context;
		const language = getLanguage(state, stateStack);
		const result = await evaluateExpression(assigned.Assign, {
			...context,
			language,
		});
		if (result == null || Array.isArray(result) || typeof result !== "object") {
			return result;
		}
		const newOutput: JSONObject = {
			...(typeof output === "object" && !Array.isArray(output) ? output : {}),
			...result,
		};
		entriesOf(result).forEach(([ k, v ]) => {
			if (v === undefined) {
				delete newOutput[ k ];
			}
		});
		return newOutput;
	};
	const getLanguage = (state: State, stateStack: State[]): QueryLanguageIdentifier => {
		if (hasQueryLanguage(state)) {
			return state.QueryLanguage;
		}
		for (const s of stateStack) {
			if (s.QueryLanguage != null) {
				return s.QueryLanguage;
			}
		}
		return stateMachine.QueryLanguage ?? options.language ?? JSONPATH;
	};
	const evaluateExpression = async (
		expr: JSONSerializable,
		context: {
			contextObject?: JSONObject,
			state: State;
			catcher?: JSONataCatcher | JSONPathCatcher | undefined;
			errorOutput?: ErrorOutput | undefined;
			input: JSONSerializable;
			language: QueryLanguageIdentifier;
			stateStack: State[];
		},
	): Promise<JSONSerializable> => {
		const language = context.language;
		if (Array.isArray(expr)) {
			return Promise.all(expr.map((v) => evaluateExpression(v, context)));
		}
		if (typeof expr === "string") {
			if (language === JSONATA) {
				if (isJSONataString(expr)) {
					return evaluateJSONata(expr, context);
				}
			} else if (language === JSONPATH) {
				if (expr.startsWith("$")) {
					return evaluateJSONPath(context.input, expr, undefined, context.contextObject);
				}
			}
			return expr;
		}
		if (expr == null || typeof expr === "boolean" || typeof expr === "number") {
			return expr;
		}
		const result: JSONObject = {};
		for await (const [ key, value ] of entriesOf(expr)) {
			let newValue: JSONSerializable;
			let assignedName = key;
			if (language === JSONPATH && isJSONPathInterpolated(key)) {
				assignedName = key.substring(0, key.length - 2);
				assertString(value, (type) => new SyntaxError(`Expected a JSONPath string for ${ key }, found ${ type }`));
				if (value.startsWith("$")) {
					newValue = evaluateJSONPath(context.input, value, undefined, context.contextObject ?? options.contextObject);
				} else {
					newValue = evaluateIntrinsicFunction(value, context.input, context.contextObject ?? options.contextObject);
				}
				if (Array.isArray(newValue) && newValue.length === 1) {
					newValue = newValue[ 0 ]!;
				}
				assertJSONSerializable(newValue);
			} else {
				newValue = await evaluateExpression(value, context);
			}
			if (assignedName === "states") {
				throw new Error("Cannot assign to a variable named 'states'");
			}
			result[ assignedName ] = newValue;
		}
		return result;
	};
	const evaluateOutput = async (context: { state: State, catcher?: JSONataCatcher | JSONPathCatcher | undefined, input: JSONSerializable, output: JSONSerializable, errorOutput?: ErrorOutput | undefined, stateStack: State[] }): Promise<JSONSerializable> => {
		try {
			let nextInput = context.output;
			const target = context.catcher ?? context.state;
			const language = getLanguage(context.state, context.stateStack);
			if (isAssignedState(target)) {
				nextInput = await runAssign({ ...context, assigned: target });
			}
			if (isOutputState(target)) {
				assertLanguage(language, JSONATA, "Output");
				nextInput = await evaluateExpression(target.Output, { ...context, language });
			}
			if (isResultSelectorState(target)) {
				assertLanguage(language, JSONPATH, "ResultSelector");
				nextInput = await evaluateExpression(target.ResultSelector, { ...context, language });
			}
			if (isResultPathState(target)) {
				assertLanguage(language, JSONPATH, "ResultPath");
				const inputCopy = deepCopy(context.input);
				/**
				 * If the value of ResultPath is null, that means that the state’s result is discarded and its raw input becomes its result.
				 */
				if (target.ResultPath != null) {
					assignJSONPath(inputCopy, target.ResultPath, nextInput);
				}
				nextInput = inputCopy;
			}
			if (isOutputPathState(target)) {
				assertLanguage(language, JSONPATH, "OutputPath");
				/**
				 * If the value of OutputPath is null, that means the input and result are discarded, and the effective output from the state is an empty JSON object, `{}`.
				 */
				if (target.OutputPath == null) {
					nextInput = {};
				} else {
					nextInput = evaluateJSONPath(nextInput, target.OutputPath);
				}
			}
			return nextInput;
		} catch (err: unknown) {
			const error: Error = err instanceof Error ? err : new UnknownError({ reason: err });
			if (context.catcher != null) {
				// We're already in a Catcher.
				throw error;
			}
			const errorOutput: ErrorOutput = {
				Cause: (error.cause instanceof Error ? error.cause.name : undefined) ?? error.name,
				Error: error.message,
			};
			return tryHandleCatch({ ...context, error, errorOutput });
		}
	};

	const assignThenContinue = async (
		{
			error,
			errorOutput,
			evalOutput = true,
			input,
			nextStateName,
			output,
			retryCount,
			state,
			stateName,
			stateStack,
		}: AssignThenContinue,
	): Promise<JSONSerializable> => {
		let nextInput: JSONSerializable;
		if (errorOutput != null) {
			if (await shouldRetry(stateName, state, errorOutput, retryCount)) {
				return runState(stateName, state, input, stateStack, retryCount + 1);
			}
			nextInput = await tryHandleCatch({ state, error, errorOutput, input, stateStack });
		} else {
			nextInput = evalOutput ? await evaluateOutput({ state, input, output, stateStack }) : output;
		}
		if (options.onStepComplete != null) {
			options.onStepComplete({ stateName, state, input, output: nextInput, stateStack });
		}
		let nextName = nextStateName;
		if (nextName == null && isNonTerminalState(state)) {
			nextName = state.Next;
		}
		if (nextName != null) {
			validateStateName(nextName);
			const nextState = expectState(nextName, stateMachine.States);
			return runState(nextName, nextState, nextInput, stateStack.concat(state));
		}
		if (isEndState(state) || isSucceedState(state)) {
			return nextInput;
		}
		throw new SyntaxError(`${ state.Type } ${ stateName } must have either Next or End=true`);
	};
	const tryHandleCatch = async (
		context: {
			state: State;
			error?: Error | undefined;
			errorOutput: ErrorOutput;
			input: JSONSerializable;
			stateStack: State[];
		},
	): Promise<JSONSerializable> => {
		const { error, state, errorOutput } = context;
		if (isCatchState(state)) {
			for await (const catcher of state.Catch) {
				if (catcher.ErrorEquals.some((errorName) => errorName === STATES_ALL || errorName === errorOutput.Cause || errorName === errorOutput.Error)) {
					return evaluateOutput({ ...context, catcher, output: {} });
				}
			}
		}
		throw error ?? new StatesError(errorOutput.Error, errorOutput.Cause ?? "Unknown error and no Catch applies");
	};

	function assertLanguage<Q extends QueryLanguageIdentifier>(actual: QueryLanguageIdentifier, expected: Q, fieldName: string): asserts actual is Q {
		if (actual !== expected) {
			throw new SyntaxError(`The ${ fieldName } expression is only valid in a ${ expected } context.`);
		}
	}

	function assertNumber(value: unknown, errorProvider: (type: string) => Error): asserts value is number {
		const type = typeof value;
		if (type !== "boolean") {
			throw errorProvider(type);
		}
	}
	const processArgs = async (context: { language: QueryLanguageIdentifier; input: JSONSerializable; state: State; stateStack: State[]; target?: State | ResultWriter }): Promise<JSONSerializable> => {
		const { language, state } = context;
		const target = context.target ?? state;
		if (isArgumentsState(target)) {
			assertLanguage(language, JSONATA, "Arguments");
			return evaluateExpression(target.Arguments, context);
		}
		let input = context.input;
		if (isInputPathState(target)) {
			/**
			 * If the value of InputPath is null, that means that the raw input is discarded, and the effective input for the state is an empty JSON object, `{}`.
			 */
			if (target.InputPath == null) {
				input = {};
			} else {
				input = await evaluateExpression(target.InputPath, { ...context, input });
			}
		}
		if (isParametersState(target)) {
			assertLanguage(language, JSONPATH, "Parameters");
			input = await evaluateExpression(target.Parameters, { ...context, input });
		}
		return input;
	};
	const shouldRetry = async (stateName: StepIdentifier, state: State | ParallelBranch, errorOutput: ErrorOutput, retryCount: number): Promise<boolean> => {
		if (!isRetryState(state)) {
			return false;
		}
		for (const retry of state.Retry) {
			const match = retry.ErrorEquals.some((err) => err === STATES_ALL || err === errorOutput.Error || err === errorOutput.Cause);
			if (match) {
				/**
				 * a field named "MaxAttempts" whose value MUST be a non-negative integer, representing the maximum number of retry attempts (default: 3)
				 */
				const maxAttempts = retry.MaxAttempts ?? 3;
				const wouldRetry = retryCount < maxAttempts;
				return (await options.onRetry?.(stateName, retry, retryCount, errorOutput, wouldRetry)) ?? wouldRetry;
			}
		}
		return false;
	};
	function assertExactlyOne<T extends object, K extends string>(name: string, value: T, ...keys: K[]): void {
		const present = keys.filter((k) => value[k as unknown as keyof T] != null);
		if (present.length > 1) {
			throw new SyntaxError(`${name} cannot have more than 1 of: ${present.join(" ")}`);
		}
	}
	const getTimeouts = async <T>(stateName: StepIdentifier, state: TaskState, language: QueryLanguageIdentifier, input: JSONSerializable, assertionBuilder: (fieldName: string) => EvaluationAssertion<number>): Promise<TimedWrapper<T> | undefined> => {
		if (!hasTimeouts(state)) {
			return undefined;
		}
		assertExactlyOne(`Task state ${ stateName }`, state, "TaskTimeout", "TaskTimeoutPath");
		assertExactlyOne(`Task state ${ stateName }`, state, "HeartbeatSeconds", "HeartbeatSecondsPath");
		const { TaskTimeout, TaskTimeoutPath, HeartbeatSeconds, HeartbeatSecondsPath } = state as HasTimeoutsState;
		if (TaskTimeout == null && TaskTimeoutPath == null && HeartbeatSeconds == null && HeartbeatSecondsPath == null) {
			return undefined;
		}
		let heartbeatSeconds: number | undefined;
		if (typeof HeartbeatSeconds === "number") {
			heartbeatSeconds = HeartbeatSeconds;
		} else if (isJSONataString(HeartbeatSeconds)) {
			assertLanguage(language, JSONATA, "HeartbeatSeconds");
			heartbeatSeconds = await evaluateJSONata(HeartbeatSeconds, { input, state }, assertionBuilder("HeartbeatSeconds"));
		} else if (isJSONPathPath(HeartbeatSecondsPath)) {
			assertLanguage(language, JSONPATH, "HeartbeatSecondsPath");
			heartbeatSeconds = evaluateJSONPath(input, HeartbeatSecondsPath, assertionBuilder("HeartbeatSecondsPath"));
		} else if (HeartbeatSeconds != null || HeartbeatSecondsPath != null) {
			throw new SyntaxError(`Task state ${stateName} has malformed HeartbeatSeconds*`);
		}
		let timeoutSecs: number;
		if (TaskTimeoutPath != null) {
			assertLanguage(language, JSONPATH, "TaskTimeoutPath");
			const timeout = evaluateJSONPath(input, TaskTimeoutPath);
			assertNumber(timeout, (type) => new SyntaxError(`State ${ stateName } TaskTimeoutPath must resolve to a number, but is ${ type }`));
			timeoutSecs = timeout;
		} else if (typeof TaskTimeout === "number") {
			timeoutSecs = TaskTimeout;
		} else if (isJSONataString(TaskTimeout)) {
			assertLanguage(language, JSONATA, "TaskTimeout");
			timeoutSecs = await evaluateJSONata(TaskTimeout, { input, state }, assertionBuilder("TaskTimeout"));
		} else {
			throw new SyntaxError(`State ${ stateName } TaskTimeout string value expected a JSONata expression`);
		}
		if (heartbeatSeconds != null) {
			const pass = options.onHeartbeatSeconds?.(heartbeatSeconds, stateName) ?? true;
			if (!pass) {
				return () => Promise.reject(new StatesError(STATES_HEARTBEAT_TIMEOUT, `Task heartbeat timeout in ${stateName}`));
			}
		}
		return (block: Promise<T>): Promise<T> => withTimeout<T>({
			timeoutMS: timeoutSecs * 1_000,
			block,
			onThrow: () => new StatesError(STATES_TIMEOUT, `Task timeout in ${ stateName }`),
		});
	};
	const evaluateJSONPath = <T extends JSONSerializable>(input: JSONSerializable, expression: string, assertion?: {
		expected: string;
		fieldName: string;
		predicate: (value: JSONSerializable) => value is T;
		stateName: StepIdentifier;
	}, contextOverride?: JSONObject): T => {
		let expr: string;
		let target: JSONSerializable;
		if (expression.startsWith("$$")) {
			expr = expression.substring(1);
			target = contextOverride ?? options.contextObject ?? {};
		} else if (expression.startsWith("$")) {
			expr = expression;
			target = input;
		} else {
			throw new SyntaxError(`Expected a JSONPath expression: ${ JSON.stringify(expression) }`);
		}
		const values = jsonpath.query(target, expr) as JSONSerializable[];
		let value: JSONSerializable = values;
		if (values.length === 1) {
			value = values[ 0 ]!;
		}
		if (assertion != null && !assertion.predicate(value)) {
			throw new SyntaxError(`State ${assertion.stateName} ${assertion.fieldName} JSONPath must resolve to ${assertion.expected}`);
		}
		return value as T;
	};

	function expectJSONPath(value: JSONSerializable, name: string): JSONPathPath {
		assertString(value, (type) => new SyntaxError(`Expected JSONPath for ${ name }, found ${ type }`));
		if (!isJSONPathPath(value)) {
			throw new SyntaxError(`Expected JSONPath for ${ name }, found: ${ JSON.stringify(value) }`);
		}
		return value;
	}

	const evaluateJSONPathChoice = async (choice: JSONPathChoiceRule, stateName: StepIdentifier, state: State, input: JSONSerializable, depth: number): Promise<boolean> => {
		if (depth > 1 && isNonTerminalState(choice)) {
			throw new SyntaxError(`State ${ stateName } Choice Rules must have Next only at the top level`);
		}
		if (isNotExpression(choice)) {
			return !(await evaluateJSONPathChoice(choice.Not, stateName, state, input, depth + 1));
		}
		if (isAndExpression(choice)) {
			for await (const expr of choice.And) {
				const result = await evaluateJSONPathChoice(expr, stateName, state, input, depth + 1);
				if (!result) {
					return false;
				}
			}
			return true;
		}
		if (isOrExpression(choice)) {
			for await (const expr of choice.Or) {
				const result = await evaluateJSONPathChoice(expr, stateName, state, input, depth + 1);
				if (result) {
					return true;
				}
			}
			return false;
		}
		if (isDataTestExpression(choice)) {
			const exprNames = Object.keys(choice).filter((k) => k !== "Variable" && k !== "Next") as (keyof DataTestExpressions)[];
			if (exprNames.length !== 1) {
				throw new SyntaxError(`State ${ stateName } Choice Rule must have exactly 1 Data Test Expression, found ${ exprNames.length === 0 ? "0" : exprNames.join(" ") }`);
			}
			let exprName = exprNames[ 0 ]!;
			const value: JSONSerializable = evaluateJSONPath(input, choice.Variable);
			let right = choice[ exprName ];
			if (right === undefined) {
				throw new SyntaxError(`State ${ stateName } Choice Rule with ${ exprName } must have a value`);
			}
			if (!isDataTestLiteralExpressionKey(exprName)) {
				exprName = toDataTestLiteralExpressionKey(exprName);
				right = evaluateJSONPath(input, expectJSONPath(right, "BooleanEqualsPath"));
			}
			switch (exprName) {
				case "BooleanEquals":
					return deepEquals(value, right);
				case "IsBoolean":
					return right === (typeof value === "boolean");
				case "IsNull":
					return right === (value === null);
				case "IsNumeric":
					return right === (typeof value === "number");
				case "IsPresent":
					return right === (jsonpath.query(input, choice.Variable).length > 0);
				case "IsString":
					return right === (typeof value === "string");
				case "IsTimestamp":
					return right === isIsoDateTime(value);
				case "NumericEquals":
					return typeof right === "number" && value === right;
				case "NumericGreaterThan":
					return typeof right === "number" && typeof value === "number" && value > right;
				case "NumericLessThan":
					return typeof right === "number" && typeof value === "number" && value < right;
				case "NumericLessThanEquals":
					return typeof right === "number" && typeof value === "number" && value <= right;
				case "NumericGreaterThanEquals":
					return typeof right === "number" && typeof value === "number" && value >= right;
				case "StringEquals":
					return typeof right === "string" && value === right;
				case "StringGreaterThan":
					return typeof right === "string" && typeof value === "string" && value.localeCompare(right) > 0;
				case "StringLessThan":
					return typeof right === "string" && typeof value === "string" && value.localeCompare(right) < 0;
				case "StringGreaterThanEquals":
					return typeof right === "string" && typeof value === "string" && value.localeCompare(right) >= 0;
				case "StringLessThanEquals":
					return typeof right === "string" && typeof value === "string" && value.localeCompare(right) <= 0;
				case "StringMatches":
					return typeof right === "string" && typeof value === "string" && simpleStarMatch(right, value);
				case "TimestampEquals":
					return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) === Date.parse(right);
				case "TimestampGreaterThan":
					return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) > Date.parse(right);
				case "TimestampGreaterThanEquals":
					return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) >= Date.parse(right);
				case "TimestampLessThan":
					return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) < Date.parse(right);
				case "TimestampLessThanEquals":
					return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) <= Date.parse(right);
				default: {
					throw new SyntaxError(`State ${ stateName } has unknown Data Test Expression: ${ JSON.stringify(exprName) }`);
				}
			}
		}
		throw new SyntaxError(`Unhandled JSONPath Choice Rule: ${ JSON.stringify(choice) }`);
	};
	const evaluateChoice = async (choice: ChoiceRule, stateName: StepIdentifier, state: State, language: QueryLanguageIdentifier, input: JSONSerializable): Promise<boolean> => {
		if (isJSONataChoiceRule(choice)) {
			assertLanguage(language, JSONATA, "Condition");
			const { Condition: condition } = choice;
			if (typeof condition === "boolean") {
				return condition;
			}
			return await evaluateJSONata(condition, { input, state }, {
				expected: "a Boolean",
				fieldName: "Condition",
				predicate: (v) => typeof v === "boolean",
				stateName,
			});
		} else {
			assertLanguage(language, JSONPATH, "And/Or/Not/Variable");
			return evaluateJSONPathChoice(choice, stateName, state, input, 1);
		}
	};

	function assertString(value: unknown, errorProvider: (type: string) => Error): asserts value is string {
		const type = typeof value;
		if (type === "string") return;
		throw errorProvider(type);
	}

	function assertNullUndef(value: unknown, errorProvider: (type: string) => Error): asserts value is (null | undefined) {
		if (value != null) {
			throw errorProvider(typeof value);
		}
	}

	/**
	 * @see {@link https://states-language.net/#map-state-concurrency | Map State concurrency}
	 */
	const getMaxConcurrency = async (state: MapState, language: QueryLanguageIdentifier, input: JSONSerializable, assertionBuilder: (fieldName: string) => EvaluationAssertion<number>, itemCount: number): Promise<number> => {
		const present = [ "MaxConcurrency", "MaxConcurrencyPath" ].filter((k) => state[k as keyof MapState] != null);
		if (present.length > 1) {
			throw new SyntaxError(`Map state may have only 1 of: ${present.join(" ")}`);
		}
		let max: number;
		if (present.length === 1) {
			if (hasNumber(state, "MaxConcurrency")) {
				max = state.MaxConcurrency;
			} else if (hasOwn(state, "MaxConcurrency", isJSONataString)) {
				assertLanguage(language, JSONATA, "MaxConcurrency");
				max = await evaluateJSONata(state.MaxConcurrency, { input, state }, assertionBuilder("MaxConcurrency"));
			} else if (hasString(state, "MaxConcurrencyPath")) {
				assertLanguage(language, JSONPATH, "MaxConcurrencyPath");
				max = evaluateJSONPath(input, state.MaxConcurrencyPath, assertionBuilder("MaxConcurrencyPath"));
			} else {
				throw new SyntaxError(`Map state has malformed ${present[0]}`);
			}
		} else {
			max = 0;
		}
		/**
		 * Its default value is zero, which places no limit on invocation parallelism and requests the interpreter to execute the iterations as concurrently as possible.
		 * A MaxConcurrency value of 1 is special, having the effect that interpreter will invoke the ItemProcessor once for each array element in the order of their appearance in the input, and will not start an iteration until the previous iteration has completed execution.
		 */
		if (max === 0) return itemCount;
		return max;
	};

	/**
	 * @see {@link https://states-language.net/#map-state-failure-tolerance | Map State failure tolerance}
	 */
	const getToleratedFailureCount = async (state: MapState, language: QueryLanguageIdentifier, input: JSONSerializable, assertionBuilder: (fieldName: string) => EvaluationAssertion<number>, itemCount: number): Promise<number> => {
		const present = [ "ToleratedFailureCount", "ToleratedFailurePercentage", "ToleratedFailureCountPath", "ToleratedFailurePercentagePath" ].filter((k) => state[k as keyof MapState] != null);
		if (present.length > 1) {
			throw new SyntaxError(`Map state may have exactly 1 ToleratedFailure* value, but found: ${present.join(" ")}`);
		}
		if (present.length === 1) {
			const fromPercent = (percent: number) => Math.floor(itemCount * (percent / 100));
			if (hasNumber(state, "ToleratedFailureCount")) {
				return state.ToleratedFailureCount;
			} else if (hasOwn(state, "ToleratedFailureCount", isJSONataString)) {
				assertLanguage(language, JSONATA, "ToleratedFailureCount");
				return evaluateJSONata(state.ToleratedFailureCount, { input, state }, assertionBuilder("ToleratedFailureCount"));
			} else if (hasNumber(state, "ToleratedFailurePercentage")) {
				return fromPercent(state.ToleratedFailurePercentage);
			} else if (hasOwn(state, "ToleratedFailurePercentage", isJSONataString)) {
				return fromPercent(await evaluateJSONata(state.ToleratedFailurePercentage, { input, state }, assertionBuilder("ToleratedFailurePercentage")));
			} else if (hasString(state, "ToleratedFailureCountPath")) {
				assertLanguage(language, JSONPATH, "ToleratedFailureCountPath");
				return evaluateJSONPath(input, state.ToleratedFailureCountPath, assertionBuilder("ToleratedFailureCountPath"));
			} else if (hasString(state, "ToleratedFailurePercentagePath")) {
				assertLanguage(language, JSONPATH, "ToleratedFailurePercentagePath");
				return fromPercent(evaluateJSONPath(input, state.ToleratedFailurePercentagePath, assertionBuilder("ToleratedFailurePercentagePath")));
			}
			throw new SyntaxError(`Map state has a malformed ${present[0]}`);
		}
		/**
		 * Its default value is zero, which means the Map State will fail if any (i.e. more than 0%) of its items fail.
		 */
		return 0;
	};

	const runState = async (stateName: StepIdentifier, state: State, input: JSONSerializable, stateStack: State[] = [], retryCount = 0): Promise<JSONSerializable> => {
		const language = getLanguage(state, stateStack);
		const stateType = state.Type;
		const positiveIntAssertion = (fieldName: string): EvaluationAssertion<number> => ({
			expected: "a positive integer",
			fieldName,
			predicate: (v): v is number => isInt(v) && v > 0,
			stateName,
		});
		const arrayAssertion = (fieldName: string): EvaluationAssertion<JSONArray> => ({
			expected: "an array",
			fieldName,
			predicate: (v): v is JSONArray => Array.isArray(v),
			stateName,
		});
		const stringAssertion = (fieldName: string): EvaluationAssertion<string> => ({
			expected: "a string",
			fieldName,
			predicate: (v) => typeof v === "string",
			stateName,
		});

		switch (state.Type) {
			case "Task": {
				const { Resource: resource, Credentials: credentials } = state;
				const fn = fnResolver(resource);
				let errorOutput: ErrorOutput | undefined;
				let output: JSONSerializable = null;
				const args = await processArgs({ input, language, state, stateStack });
				if (credentials != null && options.onCredentials?.(credentials, stateName) === false) {
					errorOutput = { Cause: `Task state ${stateName} credentials failed`, Error: STATES_PERMISSIONS };
				} else {
					try {
						const wrapper = await getTimeouts(stateName, state, language, input, positiveIntAssertion);
						let promise = fn.call(undefined, args);
						if (wrapper != null && isPromiseLike(promise)) {
							promise = wrapper(promise as Promise<unknown>);
						}
						const result = (await promise) ?? input;
						if (isJSONSerializable(result)) {
							output = result;
						} else {
							errorOutput = { Cause: `Task state ${stateName} returned non-JSON`, Error: STATES_TASK_FAILED };
						}
					} catch (err: unknown) {
						if (err instanceof Error) {
							errorOutput = { Cause: (err.cause instanceof Error ? err.cause.message : undefined) ?? err.message, Error: err.name };
						} else {
							errorOutput = { Cause: String(err), Error: STATES_TASK_FAILED };
						}
					}
				}
				return assignThenContinue({
					errorOutput,
					input,
					output,
					retryCount,
					state,
					stateName,
					stateStack,
				});
			}
			case "Fail": {
				const { Cause: cause, Error: error } = state;
				const errorPath = hasString(state, "ErrorPath") ? state.ErrorPath : undefined;
				const causePath = hasString(state, "CausePath") ? state.CausePath : undefined;
				const errorOutput: ErrorOutput = {
					...(cause == null ? {} : { Cause: cause }),
					Error: error ?? STATES_BRANCH_FAILED,
				};
				if (isJSONataString(error)) {
					assertLanguage(language, JSONATA, "Error");
					errorOutput.Error = await evaluateJSONata(error, { input, state }, stringAssertion("Error"));
				}
				if (isJSONataString(cause)) {
					assertLanguage(language, JSONATA, "Cause");
					errorOutput.Cause = await evaluateJSONata(cause, { input, state }, stringAssertion("Cause"));
				}
				if (errorPath != null) {
					assertLanguage(language, JSONPATH, "ErrorPath");
					assertNullUndef(error, () => new SyntaxError(`Fail state ${stateName} may have either Error or ErrorPath, not both`));
					errorOutput.Error = evaluateJSONPath(input, errorPath, stringAssertion("ErrorPath"));
				}
				if (causePath != null) {
					assertLanguage(language, JSONPATH, "CausePath");
					assertNullUndef(cause, () => new SyntaxError(`Fail state ${stateName} may have either Cause or CausePath, not both`));
					errorOutput.Cause = evaluateJSONPath(input, causePath, stringAssertion("CausePath"));
				}
				return assignThenContinue({ errorOutput, stateName, state, input, output: input, retryCount, stateStack });
			}
			case "Succeed": {
				return assignThenContinue({ errorOutput: undefined, input, output: input, retryCount, stateName, state, stateStack });
			}
			case "Pass": {
				const output = state.Result ?? input;
				return assignThenContinue({ errorOutput: undefined, input, output, retryCount, state, stateName, stateStack });
			}
			case "Map": {
				const { ItemProcessor: itemProcessor, ItemReader: itemReader, ItemSelector: itemSelector, ItemBatcher: itemBatcher, ResultWriter: resultWriter } = state;
				const items = hasOwn(state, "Items") ? state.Items : undefined;
				const itemsPath = hasOwn(state, "ItemsPath") ? state.ItemsPath : undefined;
				const present = [ "Items", "ItemsPath", "ItemReader" ].filter((k) => k in state && state[k as keyof MapState] != null);
				const args = await processArgs({ language, input, state, stateStack });
				if (present.length > 1) {
					throw new SyntaxError(`Map state ${stateName} cannot combine: ${present.join(" ")}`);
				}
				let inputList: JSONArray;
				if (isJSONataString(items)) {
					assertLanguage(language, JSONATA, "Items");
					inputList = await evaluateJSONata(items, { input: args, state }, arrayAssertion("Items"));
				} else if (items != null) {
					if (!isJSONArray(items)) {
						throw new SyntaxError(`Map state ${stateName} Items must be an array or a JSONata expression`);
					}
					inputList = items;
				} else if (itemsPath != null) {
					assertLanguage(language, JSONPATH, "ItemsPath");
					if (!isJSONPathPath(itemsPath)) {
						throw new SyntaxError(`Map state ${ stateName } ItemsPath must be a JSONPath expression`);
					}
					inputList = evaluateJSONPath(args, itemsPath, arrayAssertion("ItemsPath"));
				} else if (itemReader != null) {
					let resource = itemReader.Resource;
					let readerInput: JSONSerializable;
					let maxItems: number | undefined;
					if (language === JSONATA && isJSONataItemReader(itemReader)) {
						readerInput = isJSONataString(itemReader.Arguments) ? await evaluateJSONata(itemReader.Arguments, { input: args, state }) : (itemReader.Arguments ?? null);
						const { ReaderConfig: readerConfig } = itemReader;
						maxItems = readerConfig?.MaxItems == null ? undefined : typeof readerConfig.MaxItems === "number" ? readerConfig.MaxItems : await evaluateJSONata(readerConfig.MaxItems, { input: args, state }, positiveIntAssertion("MaxItems"));
					} else if (language === JSONPATH && isJSONPathItemReader(itemReader)) {
						const { ReaderConfig: readerConfig } = itemReader;
						readerInput = isJSONPathPayloadTemplate(itemReader.Parameters) ? await evaluateExpression(itemReader.Parameters, { input: args, language, state, stateStack }) : null;
						if (typeof readerConfig?.MaxItems === "number") {
							maxItems = readerConfig.MaxItems;
						} else if (isJSONPathPath(readerConfig?.MaxItemsPath)) {
							maxItems = evaluateJSONPath(args, readerConfig.MaxItemsPath, positiveIntAssertion("MaxItemsPath"));
						}
					} else {
						throw new SyntaxError(`Map state ${stateName} ItemReader for ${language} is misconfigured.`);
					}
					/**
					 * The ItemReader Configuration causes the interpreter to read items from the task identified by the ItemReader’s "Resource" field.
					 */
					const fn = fnResolver(resource);
					const readerItems = fn.call(undefined, readerInput);
					const problems = validateJSONArray(readerItems);
					if (problems.length > 0) {
						throw new ValidationError(problems, { message: `Map state ${stateName} InputReader did not return a JSON Array.` });
					}
					inputList = readerItems as JSONArray;
					if (maxItems != null && inputList.length > maxItems) {
						inputList.splice(maxItems, inputList.length - maxItems);
					}
				} else if (Array.isArray(args)) {
					/**
					 * If a Map State has neither an "ItemReader" nor an "Items" field, the items array will be the state input, which MUST be a JSON array.
					 */
					inputList = args;
				} else {
					inputList = [ args ];
				}
				/**
				 * If present, the interpreter uses the "ItemSelector" field to override each single element of the Items Array to produce an array of selected items.
				 * The interpreter uses the "ItemSelector" field to override each single element of the item array. The result of the "ItemSelector" field is called the selected item.
				 */
				if (itemSelector != null) {
					inputList = await Promise.all(inputList.map((item, index) => evaluateExpression(itemSelector, { contextObject: { Map: { Item: { Index: index, Value: item } } }, input: args, language, state, stateStack })));
				}
				/**
				 * If present, the interpreter then uses the "ItemBatcher" field to specify how to batch the selected items array to produce an array of batched selected items.
				 * The ItemBatcher Configuration causes the interpreter to batch selected items into sub-arrays before passing them to each invocation.
				 * ... the interpreter will not batch items if no "ItemBatcher" field is provided.
				 */
				if (itemBatcher != null) {
					let batchInput: JSONSerializable | undefined = itemBatcher.BatchInput;
					let maxItemsPerBatch: number | undefined;
					let maxInputBytesPerBatch: number | undefined;
					if (language === JSONATA && isJSONataItemBatcher(itemBatcher)) {
						maxItemsPerBatch = isJSONataString(itemBatcher.MaxItemsPerBatch) ? await evaluateJSONata(itemBatcher.MaxItemsPerBatch, { input: args, state },positiveIntAssertion("MaxItemsPerBatch")) : itemBatcher.MaxItemsPerBatch;
						maxInputBytesPerBatch = isJSONataString(itemBatcher.MaxInputBytesPerBatch) ? await evaluateJSONata(itemBatcher.MaxInputBytesPerBatch, { input: args, state }, positiveIntAssertion("MaxInputBytesPerBatch")) : itemBatcher.MaxInputBytesPerBatch;
					} else if (language === JSONPATH && isJSONPathItemBatcher(itemBatcher)) {
						maxItemsPerBatch = itemBatcher.MaxItemsPerBatchPath != null ? evaluateJSONPath(args, itemBatcher.MaxItemsPerBatchPath, positiveIntAssertion("MaxItemsPerBatchPath")) : itemBatcher.MaxItemsPerBatch;
						maxInputBytesPerBatch = itemBatcher.MaxInputBytesPerBatchPath != null ? evaluateJSONPath(args, itemBatcher.MaxInputBytesPerBatchPath, positiveIntAssertion("MaxInputBytesPerBatch")) : itemBatcher.MaxInputBytesPerBatch;
					} else {
						throw new SyntaxError(`Map state ${stateName} ItemBatcher is misconfigured`);
					}
					if (maxItemsPerBatch != null) {
						inputList = toBatches(maxItemsPerBatch, inputList);
					} else if (maxInputBytesPerBatch != null) {
						if (options.onMaxInputBytesPerBatch == null) {
							throw new Error(`Map state ${stateName} uses MaxInputBytesPerBatch, which requires an onMaxInputBytesPerBatch handler`);
						}
						inputList = options.onMaxInputBytesPerBatch(inputList, maxInputBytesPerBatch, stateName);
					}
					if (batchInput != null) {
						inputList = await Promise.all(inputList.map((item, index) => evaluateExpression(batchInput, { contextObject: { Map: { Item: { Index: index, Value: item } } }, state, input: args, language, stateStack })));
					}
				}
				const maxConcurrency = await getMaxConcurrency(state, language, input, positiveIntAssertion, inputList.length);
				const toleratedFailureCount = await getToleratedFailureCount(state, language, input, positiveIntAssertion, inputList.length);
				const outputs: JSONArray = [];
				const inputs = inputList.map((inputValue, index) => ({ inputValue, index }));
				let failureCount = 0;
				while (inputs.length > 0) {
					// This isn't the cleverest promise pool implementation, but it'll work.
					const batch = inputs.slice(0, maxConcurrency);
					const done = await Promise.all(batch.map(async ({ inputValue, index }) => {
						let errorOutput: ErrorOutput | undefined;
						const result = await runLocal(itemProcessor, {
							...options,
							input: inputValue,
							language,
						}).catch((err: unknown) => {
							errorOutput = err instanceof Error ? errorOutputFromError(err) : {
								Cause: String(err),
								Error: STATES_BRANCH_FAILED,
							};
							return null;
						});
						return {
							errorOutput,
							index,
							result,
						};
					}));
					for await (const { errorOutput, index, result } of done) {
						if (errorOutput != null) {
							failureCount++;
							if (failureCount > toleratedFailureCount) {
								/**
								 * If any iteration fails, due to an unhandled error or by transitioning to a Fail state,
								 * the entire Map State is considered to have failed and all the iterations are terminated.
								 * If the error is not handled by the Map State, the interpreter should terminate the machine
								 * execution with an error.
								 */
								return assignThenContinue({ errorOutput: { Cause: `${errorOutput.Error} in #${index}`, Error: STATES_EXCEED_TOLERATED_FAILURE_THRESHOLD }, input, output: null, retryCount, state, stateName, stateStack });
							}
						} else {
							outputs[index] = result;
							const inputsIndex = inputs.findIndex((v) => v.index === index);
							if (inputsIndex < 0) {
								throw new Error(`Map state ${stateName} lost track of input #${index}`);
							}
							inputs.splice(inputsIndex, 1);
						}
					}
				}
				let output: JSONSerializable = outputs;
				let errorOutput: ErrorOutput | undefined;
				/**
				 * @see {@link https://states-language.net/#writing-results | Writing Results}
				 */
				if (resultWriter != null) {
					const writerInputs = await Promise.all(outputs.map((out) => processArgs({ input: out, language, state, target: resultWriter, stateStack })));
					const fn = fnResolver(resultWriter.Resource);
					const causes: string[] = [];
					output = await Promise.all(writerInputs.map(async (writeInput, index) => {
						return (async () => await fn(writeInput))().then((value) => {
							if (isJSONSerializable(value)) return value;
							causes.push(`ResultWriter[${index}] returned non-serializable ${typeof value}`);
							return null;
						}).catch((err) => {
							const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
							causes.push(`ResultWriter[${index}] threw ${message}`);
							return null;
						});
					}));
					if (causes.length > 0) {
						errorOutput = { Cause: causes.join("; "), Error: STATES_RESULT_WRITER_FAILED };
					}
				}
				return assignThenContinue({ errorOutput, stateName, state, input, output, retryCount, stateStack });
			}
			case "Choice": {
				const { Choices: choices, Default: defaultChoice } = state;
				let nextStateName = defaultChoice;
				let output: JSONSerializable = null;
				let errorOutput: ErrorOutput | undefined;
				for await (const choice of choices) {
					const applies = await evaluateChoice(choice, stateName, state, language, input);
					if (applies) {
						nextStateName = choice.Next;
						if (isAssignedState(choice)) {
							output = await runAssign({ assigned: choice, input, output, state, stateStack });
						}
						break;
					}
				}
				if (nextStateName == null) {
					errorOutput = { Cause: `Choice state ${stateName} found no matches`, Error: STATES_NO_CHOICE_MATCHED };
				}
				return assignThenContinue({ errorOutput, input, nextStateName, output, retryCount, state, stateName, stateStack });
			}
			case "Wait": {
				const { Seconds: seconds, Timestamp: timestamp } = state;
				const secondsPath = hasString(state, "SecondsPath") ? state.SecondsPath : undefined;
				const timestampPath = hasString(state, "TimestampPath") ? state.TimestampPath : undefined;
				let until: Date;
				let sec: number | undefined;
				const now = () => (options.nowProvider?.() ?? Date.now());
				if ([ seconds, timestamp, secondsPath, timestampPath ].filter((v) => v != null).length > 1) {
					throw new SyntaxError(`Wait state ${ stateName } must have exactly one of: Seconds, SecondsPath, Timestamp`);
				} else if (seconds != null) {
					if (isJSONataString(seconds)) {
						assertLanguage(language, JSONATA, "Seconds");
						sec = await evaluateJSONata(seconds, { input, state }, positiveIntAssertion("Seconds"));
						until = new Date(now() + (sec * 1_000));
					} else {
						sec = seconds;
						until = new Date(now() + (seconds * 1_000));
					}
				} else if (timestamp != null) {
					if (isJSONataString(timestamp)) {
						assertLanguage(language, JSONATA, "Timestamp");
						until = new Date(Date.parse(await evaluateJSONata(timestamp, { input, state }, {
							expected: "an ISO8601 timestamp",
							fieldName: "Timestamp",
							predicate: isIsoDateTime,
							stateName,
						})));
					} else if (isIsoDateTime(timestamp)) {
						until = new Date(Date.parse(timestamp));
					} else {
						throw new SyntaxError(`Wait state ${ stateName } Timestamp must be in ISO8601 format`);
					}
				} else if (secondsPath != null) {
					assertLanguage(language, JSONPATH, "SecondsPath");
					const value = evaluateJSONPath(input, secondsPath);
					if (typeof value !== "number" || value < 0 || !Number.isSafeInteger(value)) {
						throw new SyntaxError(`Wait state ${ stateName } SecondsPath must resolve to a positive integer`);
					}
					sec = value;
					until = new Date(now() + (value * 1_000));
				} else if (timestampPath != null) {
					assertLanguage(language, JSONPATH, "TimestampPath");
					const value = evaluateJSONPath(input, timestampPath);
					if (!isIsoDateTime(value)) {
						throw new SyntaxError(`Wait state ${ stateName } TimestampPath must resolve to an ISO8601 timestamp`);
					}
					until = new Date(Date.parse(value));
				} else {
					throw new SyntaxError(`Wait state ${ stateName } must have Seconds or Timestamp`);
				}
				await options.onWait?.(until, sec);
				return assignThenContinue({ errorOutput: undefined, input, output: input, retryCount, state, stateName, stateStack });
			}
			case "Parallel": {
				const args = await processArgs({ input, language, state, stateStack });
				const branches = state.Branches.map((branch, index) => ({ branch, index, branchRetries: 0 }));
				const trimBranch = (index: number) => {
					const n = branches.findIndex(({ index: idx }) => index === idx);
					if (n < 0) {
						throw new Error(`Parallel state ${stateName} lost track of branch @${index}`);
					}
					branches.splice(n, 1);
				};
				const outputs = new Array<JSONSerializable>(branches.length);
				let errorOutput: ErrorOutput | undefined;
				while (branches.length > 0) {
					const settled = await Promise.all(branches.map(async ({ branch, index, branchRetries }) => {
						let success = true;
						let reason: unknown;
						const output = await runLocal(branch, {
							...options,
							language,
							input: args,
						}).catch((err: unknown) => {
							success = false;
							reason = err;
							return null;
						});
						return { branch, branchRetries, index, output, reason, retryCount, success };
					}));
					const causes: string[] = [];
					for (const { branch, success, index, output, reason, branchRetries } of settled) {
						if (success) {
							outputs[index] = output;
							trimBranch(index);
						} else {
							const error = reason instanceof Error ? reason : undefined;
							const errorOutput = error != null ? errorOutputFromError(error) : { Cause: String(reason), Error: STATES_BRANCH_FAILED };
							const parallelName = `${stateName}[${index}]`;
							const retry = await shouldRetry(parallelName, branch, errorOutput, branchRetries);
							if (retry) {
								const original = branches.find(({ index: idx }) => idx === index);
								if (original == null) {
									throw new Error(`Parallel state ${stateName} lost track of branch original @${index}`);
								}
								original.branchRetries++;
							} else {
								outputs[index] = null;
								trimBranch(index);
								causes.push(`Parallel state ${parallelName} failed`);
							}
						}
					}
					if (causes.length > 0) {
						errorOutput = { Cause: causes.join("; "), Error: STATES_BRANCH_FAILED };
						break;
					}
				}
				return assignThenContinue({ errorOutput, input, output: outputs, retryCount, state, stateName, stateStack });
			}
			default: {
				throw new Error(`Not implemented: runState(Type=${ stateType })`);
			}
		}
	};
	return runState(stateMachine.StartAt, expectState(stateMachine.StartAt, stateMachine.States), options.input ?? {});
};

export function validateStateName(name: string): asserts name is StepIdentifier {
	if (name.length > 80) {
		throw new SyntaxError(`State name should be <= 80 characters: ${ name }`);
	}
}

export const expectState = (name: StepIdentifier, states: Record<StepIdentifier, State>): State => {
	validateStateName(name);
	const state = states[ name ];
	if (state == null) {
		throw new SyntaxError(`Missing state: ${ name }`);
	}
	return state;
};
