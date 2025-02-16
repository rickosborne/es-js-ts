import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPathChoice } from "./evaluate-jsonpath-choice.js";
import type { RunStateMachineOptions } from "./run-types.js";
import {
	type ChoiceRule,
	isJSONataChoiceRule,
	JSONATA,
	JSONPATH,
	type QueryLanguageIdentifier,
	type State,
	type StateIdentifier,
} from "./sfn-types.js";

/**
 * Evaluate whether a given Choice Rule matches the current State.
 */
export const evaluateChoice = async (
	choice: ChoiceRule,
	context: {
		input: JSONSerializable;
		language: QueryLanguageIdentifier;
		options: RunStateMachineOptions;
		state: State,
		stateName: StateIdentifier;
	},
): Promise<boolean> => {
	const { language, stateName } = context;
	if (isJSONataChoiceRule(choice)) {
		assertLanguage(language, JSONATA, "Condition");
		const { Condition: condition } = choice;
		if (typeof condition === "boolean") {
			return condition;
		}
		return await evaluateJSONata(condition, context, {
			expected: "a Boolean",
			fieldName: "Condition",
			predicate: (v) => typeof v === "boolean",
			stateName,
		});
	} else {
		assertLanguage(language, JSONPATH, "And/Or/Not/Variable");
		return evaluateJSONPathChoice(choice, 1, context);
	}
};
