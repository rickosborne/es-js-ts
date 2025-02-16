import type { JSONSerializable } from "@rickosborne/typical";
import { assignThenContinue } from "./assign-then-continue.js";
import type { RunStateContext } from "./run-types.js";
import type { SucceedState } from "./sfn-types.js";

/**
 * Run the given Succeed State.
 */
export const runSucceed = async (
	context: RunStateContext<SucceedState>,
): Promise<JSONSerializable> => {
	return assignThenContinue({ ...context, errorOutput: undefined, output: context.input });
};
