import { deepCopy, UnknownError } from "@rickosborne/foundation";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { assignJSONPath } from "./assign-json-path.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { getLanguage } from "./get-language.js";
import { runAssign } from "./run-assign.js";
import type { RunStateContext, RunStateMachineOptions } from "./run-types.js";
import {
	type Catcher,
	type ErrorOutput,
	isAssignedState,
	isOutputPathState,
	isOutputState,
	isResultPathState,
	isResultSelectorState,
	JSONATA,
	type JSONataCatcher,
	JSONPATH,
	type JSONPathCatcher,
	type State,
	type StateIdentifier,
	type StateMachine,
} from "./sfn-types.js";
import { tryHandleCatch } from "./try-handle-catch.js";

/**
 * For the various ways a State can modify its output, go through each.
 */
export const evaluateOutput = async (
	context: {
		catcher?: JSONataCatcher | JSONPathCatcher | undefined;
		errorOutput?: ErrorOutput | undefined;
		evaluateOutput: (context: RunStateContext<State> & { catcher?: Catcher; output: JSONSerializable }) => Promise<JSONSerializable>;
		input: JSONSerializable;
		onNextState: (context: RunStateContext<State>) => Promise<JSONSerializable>;
		options: RunStateMachineOptions;
		output: JSONSerializable;
		retryCount: number;
		state: State;
		stateMachine: StateMachine;
		stateName: StateIdentifier;
		stateStack: State[]
	},
): Promise<JSONSerializable> => {
	const { catcher, options, output, state } = context;
	const language = getLanguage(context);
	try {
		let nextInput = output;
		const target = catcher ?? state;
		if (isAssignedState(target)) {
			nextInput = await runAssign(output, target, context);
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
				nextInput = evaluateJSONPath(target.OutputPath, { input: nextInput, options });
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
