import type { JSONArray, JSONObject, JSONSerializable } from "@rickosborne/typical";
import type {
	Catcher,
	ErrorOutput,
	QueryLanguageIdentifier,
	ResourceURI,
	Retrier,
	State,
	StateIdentifier,
	StateMachine,
} from "./sfn-types.js";

/**
 * A (local) function which accepts only JSON-serializable params and
 * returns only JSON-serializable results, if any, or a promise for
 * the same.
 */
export type StepFunctionLambdaLike = (...args: JSONSerializable[]) => (JSONSerializable | undefined | Promise<JSONSerializable | undefined>);

/**
 * Resolve a resource URI to a local runnable function.
 */
export type ResourceHandlerResolver = (resourceUri: ResourceURI) => StepFunctionLambdaLike;

/**
 * Initial options for running a State Machine.
 */
export interface RunStateMachineOptions {
	/**
	 * An initial Context Object.
	 * @defaultValue `{}`
	 */
	contextObject?: JSONObject;
	/**
	 * A resolver for Resource implementations, usually by Lambda ARN.
	 * Can be a static Record, such as for unit tests, or a function.
	 */
	fnForResource?: Record<ResourceURI, StepFunctionLambdaLike> | ResourceHandlerResolver;
	/**
	 * Provide initial input for the State Machine.
	 * @defaultValue `{}`
	 */
	input?: JSONSerializable;
	/**
	 * Provide an initial language for the State Machine.  It is uncommon
	 * to use this, as you almost always want to define this in the state
	 * machine itself.
	 */
	language?: QueryLanguageIdentifier;
	/**
	 * Provide a replacement for `Date.now()`, usually for testing.
	 */
	nowProvider?: () => number;
	/**
	 * Simulate a Task passing or failing a credentials check. Return `true` to
	 * proceed as normal, or `false` to force a `States.Permissions` failure.
	 */
	onCredentials?: (credentials: JSONObject, stateName: StateIdentifier) => boolean;
	/**
	 * Simulate a Task passing or failing a heartbeat check. Return `true` to
	 * proceed as normal, or `false` to force a `States.HeartbeatTimeout` failure.
	 */
	onHeartbeatSeconds?: (seconds: number, stateName: StateIdentifier) => boolean;
	/**
	 * When a `Parallel` state specifies batching by input size, provide
	 * and implementation to produce the batches.
	 */
	onMaxInputBytesPerBatch?: (items: JSONArray, maxInputBytesPerBatch: number, stateName: StateIdentifier) => JSONArray;
	// noinspection SpellCheckingInspection
	/**
	 * Called when evaluating whether to retry a failure.
	 * Since this implementation won't actually delay, you will need
	 * to work out your own `sleep` equivalent to add the delay here.
	 * The `retryCount` value here starts at `0` to indicate that
	 * one failure has occurred, but zero retries have been attempted.
	 */
	onRetry?: (stateName: string, retrier: Retrier, retryCount: number, errorOutput: ErrorOutput, wouldRetry: boolean) => Promise<boolean | undefined>;
	/**
	 * Get notifications for when a State is finished running.
	 */
	onStateComplete?: (finished: Readonly<{
		readonly stateName: StateIdentifier;
		readonly state: Readonly<State>;
		readonly input: Readonly<JSONSerializable>;
		readonly output: Readonly<JSONSerializable>;
		readonly stateStack: Readonly<Readonly<State>[]>;
	}>) => void;
	/**
	 * When a `Wait` state is encountered, provide a `sleep` implementation.
	 * If not provided, execution continues immediately and does not
	 * actually wait.
	 */
	onWait?: (until: Date, seconds?: number | undefined) => Promise<void>;
}

/**
 * A value type guard/assertion which should happen after evaluating
 * a JSONata or JSONPath expression.
 */
export interface EvaluationAssertion<T extends JSONSerializable> {
	expected: string;
	fieldName: string;
	predicate: (value: JSONSerializable) => value is T;
	stateName: StateIdentifier;
}

/**
 * Shared context needed for running any State.
 */
export interface RunStateContext<StateT extends State> {
	evaluateOutput: (context: RunStateContext<State> & { catcher?: Catcher; output: JSONSerializable }) => Promise<JSONSerializable>;
	input: JSONSerializable;
	options: RunStateMachineOptions;
	onNextState: (context: RunStateContext<State>) => Promise<JSONSerializable>;
	retryCount: number;
	state: StateT;
	stateMachine: StateMachine;
	stateName: StateIdentifier;
	stateStack: State[];
}
