import type { JSONSerializable } from "@rickosborne/typical";
import type { RunStateContext, RunStateMachineOptions } from "./run-types.js";
import {
	type Catcher,
	type ErrorOutput,
	isCatchState,
	type State,
	type StateIdentifier,
	type StateMachine,
	STATES_ALL,
} from "./sfn-types.js";
import { StatesError } from "./states-error.js";

/**
 * If the current State has a Catch expression, try to evaluate it to see what to do next.
 */
export const tryHandleCatch = async (
	context: {
		input: JSONSerializable;
		error?: Error | undefined;
		errorOutput: ErrorOutput;
		evaluateOutput: (context: RunStateContext<State> & { catcher?: Catcher; output: JSONSerializable }) => Promise<JSONSerializable>;
		options: RunStateMachineOptions;
		onNextState: (context: RunStateContext<State>) => Promise<JSONSerializable>;
		retryCount: number;
		state: State;
		stateMachine: StateMachine;
		stateName: StateIdentifier;
		stateStack: State[];
	},
): Promise<JSONSerializable> => {
	const { error, errorOutput, state } = context;
	if (isCatchState(state)) {
		for await (const catcher of state.Catch) {
			if (catcher.ErrorEquals.some((errorName) => errorName === STATES_ALL || errorName === errorOutput.Cause || errorName === errorOutput.Error)) {
				return context.evaluateOutput({ ...context, catcher, output: {} });
			}
		}
	}
	throw error ?? new StatesError(errorOutput.Error, errorOutput.Cause ?? "Unknown error and no Catch applies");
};
