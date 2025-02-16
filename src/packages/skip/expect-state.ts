import { assertValidStateName } from "./assert-valid-state-name.js";
import type { State, StateIdentifier, StateMachine } from "./sfn-types.js";

/**
 * Find the given State by its identifier in the given State Machine, throwing
 * if it is not found.
 */
export const expectState = (
	name: StateIdentifier,
	stateMachine: StateMachine,
): State => {
	assertValidStateName(name);
	const state = stateMachine.States[ name ];
	if (state == null) {
		throw new SyntaxError(`Missing state: ${ name }`);
	}
	return state;
};
