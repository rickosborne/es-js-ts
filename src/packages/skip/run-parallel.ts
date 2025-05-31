import type { JSONSerializable } from "@rickosborne/typical";
import { assignThenContinue } from "./assign-then-continue.js";
import { errorOutputFromError } from "./error-output-from-error.js";
import { getLanguage } from "./get-language.js";
import { processArgs } from "./process-args.js";
import { runStateMachine } from "./run-state-machine.js";
import type { RunStateContext } from "./run-types.js";
import { type ErrorOutput, type ParallelState, STATES_BRANCH_FAILED } from "./sfn-types.js";
import { shouldRetry } from "./should-retry.js";

/**
 * Run the given Parallel State.
 */
export const runParallel = async (
	context: RunStateContext<ParallelState>,
): Promise<JSONSerializable> => {
	const { options, retryCount, state, stateName } = context;
	const language = getLanguage(context);
	const args = await processArgs(context);
	const branches = state.Branches.map((branch, index) => ({ branch, index, branchRetries: 0 }));
	const trimBranch = (index: number) => {
		const n = branches.findIndex(({ index: idx }) => index === idx);
		if (n < 0) {
			throw new Error(`Parallel state ${ stateName } lost track of branch @${ index }`);
		}
		branches.splice(n, 1);
	};
	const outputs = new Array<JSONSerializable>(branches.length);
	let errorOutput: ErrorOutput | undefined;
	while (branches.length > 0) {
		const settled = await Promise.all(branches.map(async ({ branch, index, branchRetries }) => {
			let success = true;
			let reason: unknown;
			const output = await runStateMachine(branch, {
				...options,
				language,
				input: args,
			}).catch((err: unknown) => {
				success = false;
				reason = err;
				return null;
			});
			return { branchRetries, index, output, reason, retryCount, success };
		}));
		const causes: string[] = [];
		for (const { success, index, output, reason, branchRetries } of settled) {
			if (success) {
				outputs[ index ] = output;
				trimBranch(index);
			} else {
				const error = reason instanceof Error ? reason : undefined;
				const errorOut = error != null ? errorOutputFromError(error) : { Cause: String(reason), Error: STATES_BRANCH_FAILED };
				const parallelName = `${ stateName }[${ index }]`;
				const retry = await shouldRetry({ stateName: parallelName, state, errorOutput: errorOut, options, retryCount: branchRetries });
				if (retry) {
					const original = branches.find(({ index: idx }) => idx === index);
					if (original == null) {
						throw new Error(`Parallel state ${ stateName } lost track of branch original @${ index }`);
					}
					original.branchRetries++;
				} else {
					outputs[ index ] = null;
					trimBranch(index);
					causes.push(`Parallel state ${ parallelName } failed`);
				}
			}
		}
		if (causes.length > 0) {
			errorOutput = { Cause: causes.join("; "), Error: STATES_BRANCH_FAILED };
			break;
		}
	}
	return assignThenContinue({ ...context, errorOutput, output: outputs });
};
