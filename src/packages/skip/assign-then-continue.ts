import type { JSONSerializable } from "@rickosborne/typical";
import { assertValidStateName } from "./assert-valid-state-name.js";
import { expectState } from "./expect-state.js";
import type { RunStateContext, RunStateMachineOptions } from "./run-types.js";
import {
	type Catcher,
	type ErrorOutput,
	isEndState,
	isNonTerminalState,
	isSucceedState,
	type State,
	type StateIdentifier,
	type StateMachine,
} from "./sfn-types.js";
import { shouldRetry } from "./should-retry.js";
import { tryHandleCatch } from "./try-handle-catch.js";

/**
 * After the main part of a State has been evaluated, handle any Catch or Retry as applicable,
 * and then transition to the next state.
 */
export const assignThenContinue = async (
	context: {
		error?: Error | undefined;
		errorOutput: ErrorOutput | undefined;
		evalOutput?: boolean | undefined;
		evaluateOutput: (context: RunStateContext<State> & { catcher?: Catcher; output: JSONSerializable }) => Promise<JSONSerializable>;
		input: JSONSerializable;
		nextStateName?: StateIdentifier | undefined;
		onNextState: (context: RunStateContext<State>) => Promise<JSONSerializable>;
		options: RunStateMachineOptions;
		output: JSONSerializable;
		retryCount: number;
		state: State;
		stateMachine: StateMachine;
		stateName: StateIdentifier;
		stateStack: State[];
	},
): Promise<JSONSerializable> => {
	const { errorOutput, evalOutput = true, nextStateName, options, output, retryCount, state, stateName, stateMachine, stateStack } = context;
	let nextInput: JSONSerializable;
	if (errorOutput != null) {
		if (await shouldRetry({ ...context, errorOutput })) {
			return context.onNextState({ ...context, retryCount: retryCount + 1 });
		}
		nextInput = await tryHandleCatch({ ...context, errorOutput });
	} else {
		nextInput = evalOutput ? await context.evaluateOutput(context) : output;
	}
	if (options.onStateComplete != null) {
		options.onStateComplete({ ...context, output: nextInput });
	}
	let nextName = nextStateName;
	if (nextName == null && isNonTerminalState(state)) {
		nextName = state.Next;
	}
	if (nextName != null) {
		assertValidStateName(nextName);
		const nextState = expectState(nextName, stateMachine);
		return context.onNextState({ ...context, stateName: nextName, state: nextState, input: nextInput, stateStack: stateStack.concat(state) });
	}
	if (isEndState(state) || isSucceedState(state)) {
		return nextInput;
	}
	throw new SyntaxError(`${ state.Type } ${ stateName } must have either Next or End=true`);
};
