import type { JSONSerializable } from "@rickosborne/typical";
import { evaluateOutput } from "./evaluate-output.js";
import { expectState } from "./expect-state.js";
import { runState } from "./run-state.js";
import type { RunStateMachineOptions } from "./run-types.js";
import { type StateMachine } from "./sfn-types.js";

export const runLocal = async (
	stateMachine: StateMachine,
	options: RunStateMachineOptions = {},
): Promise<JSONSerializable> => {
	return runState({
		input: options.input ?? {},
		evaluateOutput,
		options,
		onNextState: runState,
		retryCount: 0,
		state: expectState(stateMachine.StartAt, stateMachine),
		stateMachine,
		stateName: stateMachine.StartAt,
		stateStack: [],
	});
};

