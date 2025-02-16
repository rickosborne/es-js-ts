import type { JSONSerializable } from "@rickosborne/typical";
import { runChoice } from "./run-choice.js";
import { runFail } from "./run-fail.js";
import { runMap } from "./run-map.js";
import { runParallel } from "./run-parallel.js";
import { runPass } from "./run-pass.js";
import { runSucceed } from "./run-succeed.js";
import { runTask } from "./run-task.js";
import type { RunStateContext } from "./run-types.js";
import { runWait } from "./run-wait.js";
import { type State, type StateForType, TYPE_CHOICE, TYPE_FAIL, TYPE_MAP, TYPE_PARALLEL, TYPE_PASS, TYPE_SUCCEED, TYPE_TASK, TYPE_WAIT } from "./sfn-types.js";

type StateRunner<S extends State> = (context: RunStateContext<S>) => Promise<JSONSerializable>;

const STATE_RUNNERS: {
	[K in keyof StateForType]: StateRunner<StateForType[K]>;
} = {
	[TYPE_CHOICE]: runChoice,
	[TYPE_FAIL]: runFail,
	[TYPE_MAP]: runMap,
	[TYPE_PARALLEL]: runParallel,
	[TYPE_PASS]: runPass,
	[TYPE_SUCCEED]: runSucceed,
	[TYPE_TASK]: runTask,
	[TYPE_WAIT]: runWait,
};

/**
 * Run the given State.
 */
export const runState = async <S extends State>(
	context: RunStateContext<S>,
): Promise<JSONSerializable> => {
	const state: S = context.state;
	const runner = STATE_RUNNERS[state.Type] as StateRunner<S> | undefined;
	if (runner == null) {
		throw new Error(`Unknown state Type: ${ state.Type }`);
	}
	return runner(context);
};
