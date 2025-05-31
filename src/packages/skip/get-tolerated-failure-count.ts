import { hasNumber, hasOwn, hasString } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import type { EvaluationAssertion, RunStateMachineOptions } from "./run-types.js";
import { isJSONataString, JSONATA, JSONPATH, type MapState, type QueryLanguageIdentifier, type StateIdentifier } from "./sfn-types.js";

/**
 * Try to figure out the configured tolerated failure count of a Map State.
 * @see {@link https://states-language.net/#map-state-failure-tolerance | Map State failure tolerance}
 */
export const getToleratedFailureCount = async (
	context: {
		assertionBuilder: (fieldName: string, stateIdent: StateIdentifier) => EvaluationAssertion<number>;
		input: JSONSerializable;
		itemCount: number;
		language: QueryLanguageIdentifier;
		options: RunStateMachineOptions;
		state: MapState;
		stateName: StateIdentifier;
	},
): Promise<number> => {
	const { assertionBuilder, input, itemCount, language, state, stateName } = context;
	const present = [ "ToleratedFailureCount", "ToleratedFailurePercentage", "ToleratedFailureCountPath", "ToleratedFailurePercentagePath" ].filter((k) => state[ k as keyof MapState ] != null);
	if (present.length > 1) {
		throw new SyntaxError(`Map state may have exactly 1 ToleratedFailure* value, but found: ${ present.join(" ") }`);
	}
	if (present.length === 1) {
		const fromPercent = (percent: number) => Math.floor(itemCount * (percent / 100));
		if (hasNumber(state, "ToleratedFailureCount")) {
			return state.ToleratedFailureCount;
		} else if (hasOwn(state, "ToleratedFailureCount", isJSONataString)) {
			assertLanguage(language, JSONATA, "ToleratedFailureCount");
			return evaluateJSONata(state.ToleratedFailureCount, { input, state }, assertionBuilder("ToleratedFailureCount", stateName));
		} else if (hasNumber(state, "ToleratedFailurePercentage")) {
			return fromPercent(state.ToleratedFailurePercentage);
		} else if (hasOwn(state, "ToleratedFailurePercentage", isJSONataString)) {
			return fromPercent(await evaluateJSONata(state.ToleratedFailurePercentage, { input, state }, assertionBuilder("ToleratedFailurePercentage", stateName)));
		} else if (hasString(state, "ToleratedFailureCountPath")) {
			assertLanguage(language, JSONPATH, "ToleratedFailureCountPath");
			return evaluateJSONPath(state.ToleratedFailureCountPath, context, assertionBuilder("ToleratedFailureCountPath", stateName));
		} else if (hasString(state, "ToleratedFailurePercentagePath")) {
			assertLanguage(language, JSONPATH, "ToleratedFailurePercentagePath");
			return fromPercent(evaluateJSONPath(state.ToleratedFailurePercentagePath, context, assertionBuilder("ToleratedFailurePercentagePath", stateName)));
		}
		throw new SyntaxError(`Map state has a malformed ${ present[ 0 ] }`);
	}
	/**
	 * Its default value is zero, which means the Map State will fail if any (i.e. more than 0%) of its items fail.
	 */
	return 0;
};
