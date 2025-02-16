import { entriesOf } from "@rickosborne/foundation";
import type { JSONObject, JSONSerializable } from "@rickosborne/typical";
import { evaluateExpression } from "./evaluate-expression.js";
import { getLanguage } from "./get-language.js";
import type { RunStateMachineOptions } from "./run-types.js";
import type { AssignedState, State, StateMachine } from "./sfn-types.js";

/**
 * If the current State can use `Assign`, evaluate that to modify the given output.
 */
export const runAssign = async (
	output: JSONSerializable,
	assigned: AssignedState,
	context: {
		input: JSONSerializable;
		options: RunStateMachineOptions;
		state: State;
		stateMachine: StateMachine;
		stateStack: State[];
	},
): Promise<JSONSerializable> => {
	const { state, options, stateMachine } = context;
	const language = getLanguage({ options, state, stateMachine });
	const result = await evaluateExpression(assigned.Assign, {
		...context,
		language,
	});
	if (result == null || Array.isArray(result) || typeof result !== "object") {
		return result;
	}
	const newOutput: JSONObject = {
		...(typeof output === "object" && !Array.isArray(output) ? output : {}),
		...result,
	};
	entriesOf(result).forEach(([ k, v ]) => {
		if (v === undefined) {
			delete newOutput[ k ];
		}
	});
	return newOutput;
};
