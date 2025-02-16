import type { JSONSerializable } from "@rickosborne/typical";
import { assignThenContinue } from "./assign-then-continue.js";
import { evaluateChoice } from "./evaluate-choice.js";
import { getLanguage } from "./get-language.js";
import { runAssign } from "./run-assign.js";
import type { RunStateContext } from "./run-types.js";
import { type ChoiceState, type ErrorOutput, isAssignedState, STATES_NO_CHOICE_MATCHED } from "./sfn-types.js";

/**
 * Run the given Choice State.
 */
export const runChoice = async (
	context: RunStateContext<ChoiceState>,
): Promise<JSONSerializable> => {
	const { state, stateName } = context;
	const language = getLanguage(context);
	const { Choices: choices, Default: defaultChoice } = state;
	let nextStateName = defaultChoice;
	let output: JSONSerializable = null;
	let errorOutput: ErrorOutput | undefined;
	for await (const choice of choices) {
		const applies = await evaluateChoice(choice, { ...context, language });
		if (applies) {
			nextStateName = choice.Next;
			if (isAssignedState(choice)) {
				output = await runAssign(output, choice, context);
			}
			break;
		}
	}
	if (nextStateName == null) {
		errorOutput = { Cause: `Choice state ${ stateName } found no matches`, Error: STATES_NO_CHOICE_MATCHED };
	}
	return assignThenContinue({ ...context, errorOutput, nextStateName, output });
};
