import type { RunStateMachineOptions } from "./run-types.js";
import { type ErrorOutput, isRetryState, type State, type StateIdentifier, STATES_ALL } from "./sfn-types.js";

/**
 * Figure out whether a failed State should attempt a retry, based
 * on its configuration and the current retry count.
 */
export const shouldRetry = async (
	context: {
		errorOutput: ErrorOutput;
		options: RunStateMachineOptions;
		retryCount: number;
		state: State;
		stateName: StateIdentifier;
	},
): Promise<boolean> => {
	const { errorOutput, options, retryCount, state, stateName } = context;
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
