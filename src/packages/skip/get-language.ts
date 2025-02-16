import type { RunStateMachineOptions } from "./run-types.js";
import {
	hasQueryLanguage,
	JSONPATH,
	type QueryLanguageIdentifier,
	type State,
	type StateMachine,
} from "./sfn-types.js";

/**
 * Figure out what the current query language is based on the current
 * State, its parent State Machine, or the provided Run options.
 */
export const getLanguage = (
	context: {
		options: RunStateMachineOptions,
		state: State,
		stateMachine: StateMachine,
	},
): QueryLanguageIdentifier => {
	if (hasQueryLanguage(context.state)) {
		return context.state.QueryLanguage;
	}
	return context.stateMachine.QueryLanguage ?? context.options.language ?? JSONPATH;
};
