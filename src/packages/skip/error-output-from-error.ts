import type { ErrorOutput } from "./sfn-types.js";
import { StatesError } from "./states-error.js";

/**
 * Format an {@link ErrorOutput} based on the information in an `Error`.
 * Tries to find the root cause, if present.
 */
export const errorOutputFromError = (error: Error): ErrorOutput => {
	const seen = new Set<Error>();
	let err: Error = error;
	do {
		if (seen.has(err)) {
			break;
		}
		seen.add(err);
		if (err instanceof StatesError) {
			break;
		}
		if (err.cause == null || !(err.cause instanceof Error)) {
			break;
		}
		err = err.cause;
	} while (true);
	return { Cause: err.message, Error: err.name };
};
