import type { JSONSerializable } from "@rickosborne/typical";
import { assignThenContinue } from "./assign-then-continue.js";
import type { RunStateContext } from "./run-types.js";
import type { PassState } from "./sfn-types.js";

/**
 * Run the given Pass State.
 */
export const runPass = async (
	context: RunStateContext<PassState>,
): Promise<JSONSerializable> => {
	return assignThenContinue({ ...context, errorOutput: undefined, output: context.state.Result ?? context.input });
};
