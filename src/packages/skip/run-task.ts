import { isJSONSerializable, isPromiseLike } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import { assignThenContinue } from "./assign-then-continue.js";
import { positiveIntAssertion } from "./evaluation-assertion.js";
import { getLanguage } from "./get-language.js";
import { getTimeouts } from "./get-timeouts.js";
import { processArgs } from "./process-args.js";
import { resourceHandlerResolver } from "./resource-handler-resolver.js";
import type { RunStateContext } from "./run-types.js";
import { type ErrorOutput, STATES_PERMISSIONS, STATES_TASK_FAILED, type TaskState } from "./sfn-types.js";

/**
 * Run the given Task state.
 */
export const runTask = async (
	context: RunStateContext<TaskState>,
): Promise<JSONSerializable> => {
	const { input, options, state, stateName } = context;
	const language = getLanguage(context);
	const { Resource: resource, Credentials: credentials } = state;
	const fn = resourceHandlerResolver(options)(resource);
	let errorOutput: ErrorOutput | undefined;
	let output: JSONSerializable = null;
	const args = await processArgs(context);
	if (credentials != null && options.onCredentials?.(credentials, stateName) === false) {
		errorOutput = { Cause: `Task state ${ stateName } credentials failed`, Error: STATES_PERMISSIONS };
	} else {
		try {
			const wrapper = await getTimeouts({ ...context, assertionBuilder: positiveIntAssertion, language });
			let promise = fn.call(undefined, args);
			if (wrapper != null && isPromiseLike(promise)) {
				// noinspection ES6MissingAwait
				promise = wrapper(promise) as Promise<JSONSerializable>;
			}
			const result = (await promise) ?? input;
			if (isJSONSerializable(result)) {
				output = result;
			} else {
				errorOutput = { Cause: `Task state ${ stateName } returned non-JSON`, Error: STATES_TASK_FAILED };
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				errorOutput = { Cause: (err.cause instanceof Error ? err.cause.message : undefined) ?? err.message, Error: err.name };
			} else {
				errorOutput = { Cause: String(err), Error: STATES_TASK_FAILED };
			}
		}
	}
	return assignThenContinue({ ...context, errorOutput, output });
};
