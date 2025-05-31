import { withTimeout } from "@rickosborne/foundation";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertExactlyOne } from "./assert-exactly-one.js";
import { assertLanguage } from "./assert-language.js";
import { assertNumber } from "./assert-number.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import type { EvaluationAssertion, RunStateMachineOptions } from "./run-types.js";
import {
	hasTimeouts,
	type HasTimeoutsState,
	isJSONataString,
	isJSONPathPath,
	JSONATA,
	JSONPATH,
	type QueryLanguageIdentifier,
	type StateIdentifier,
	STATES_HEARTBEAT_TIMEOUT,
	STATES_TIMEOUT,
	type TaskState,
} from "./sfn-types.js";
import { StatesError } from "./states-error.js";

type TimedWrapper<T> = (promise: Promise<T>) => Promise<T>;

/**
 * Try to figure out the timeout/heartbeat configuration for a State.
 * Instead of returning a timeout, returns a wrapper which will
 * throw/return based on that timeout or heartbeat.
 */
export const getTimeouts = async <T>(
	context: {
		assertionBuilder: (fieldName: string, stateIdent: string) => EvaluationAssertion<number>;
		input: JSONSerializable;
		language: QueryLanguageIdentifier;
		options: RunStateMachineOptions;
		state: TaskState;
		stateName: StateIdentifier;
	},
): Promise<TimedWrapper<T> | undefined> => {
	const { assertionBuilder, input, language, options, state, stateName } = context;
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
		heartbeatSeconds = await evaluateJSONata(HeartbeatSeconds, context, assertionBuilder("HeartbeatSeconds", stateName));
	} else if (isJSONPathPath(HeartbeatSecondsPath)) {
		assertLanguage(language, JSONPATH, "HeartbeatSecondsPath");
		heartbeatSeconds = evaluateJSONPath(HeartbeatSecondsPath, context, assertionBuilder("HeartbeatSecondsPath", stateName));
	} else if (HeartbeatSeconds != null || HeartbeatSecondsPath != null) {
		throw new SyntaxError(`Task state ${ stateName } has malformed HeartbeatSeconds*`);
	}
	let timeoutSecs: number;
	if (TaskTimeoutPath != null) {
		assertLanguage(language, JSONPATH, "TaskTimeoutPath");
		const timeout = evaluateJSONPath(TaskTimeoutPath, { input, options });
		assertNumber(timeout, (type) => new SyntaxError(`State ${ stateName } TaskTimeoutPath must resolve to a number, but is ${ type }`));
		timeoutSecs = timeout;
	} else if (typeof TaskTimeout === "number") {
		timeoutSecs = TaskTimeout;
	} else if (isJSONataString(TaskTimeout)) {
		assertLanguage(language, JSONATA, "TaskTimeout");
		timeoutSecs = await evaluateJSONata(TaskTimeout, { input, state }, assertionBuilder("TaskTimeout", stateName));
	} else {
		throw new SyntaxError(`State ${ stateName } TaskTimeout string value expected a JSONata expression`);
	}
	if (heartbeatSeconds != null) {
		const pass = options.onHeartbeatSeconds?.(heartbeatSeconds, stateName) ?? true;
		if (!pass) {
			return () => Promise.reject(new StatesError(STATES_HEARTBEAT_TIMEOUT, `Task heartbeat timeout in ${ stateName }`));
		}
	}
	return (block: Promise<T>): Promise<T> => withTimeout<T>({
		timeoutMS: timeoutSecs * 1_000,
		block,
		onThrow: () => new StatesError(STATES_TIMEOUT, `Task timeout in ${ stateName }`),
	});
};
