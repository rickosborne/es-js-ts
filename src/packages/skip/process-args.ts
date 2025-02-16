import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { getLanguage } from "./get-language.js";
import type { RunStateMachineOptions } from "./run-types.js";
import {
	isArgumentsState,
	isInputPathState,
	isParametersState,
	JSONATA,
	JSONPATH,
	type ResultWriter,
	type State,
	type StateMachine,
} from "./sfn-types.js";

/**
 * Try to find the `Arguments`, `InputPath`, and `Parameters` for
 * the target, and evaluate them as necessary to modify the input
 * for the current State.
 */
export const processArgs = async (
	context: {
		input: JSONSerializable;
		options: RunStateMachineOptions;
		state: State;
		stateMachine: StateMachine;
		stateStack: State[];
	},
	targetOverride?: ResultWriter,
): Promise<JSONSerializable> => {
	const { state } = context;
	const language = getLanguage(context);
	const target = targetOverride ?? state;
	if (isArgumentsState(target)) {
		assertLanguage(language, JSONATA, "Arguments");
		return evaluateExpression(target.Arguments, { ...context, language });
	}
	let input = context.input;
	if (isInputPathState(target)) {
		/**
		 * If the value of InputPath is null, that means that the raw input is discarded, and the effective input for the state is an empty JSON object, `{}`.
		 */
		if (target.InputPath == null) {
			input = {};
		} else {
			input = await evaluateExpression(target.InputPath, { ...context, input, language });
		}
	}
	if (isParametersState(target)) {
		assertLanguage(language, JSONPATH, "Parameters");
		input = await evaluateExpression(target.Parameters, { ...context, input, language });
	}
	return input;
};
