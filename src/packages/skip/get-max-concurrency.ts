import { hasNumber, hasOwn, hasString } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import type { EvaluationAssertion, RunStateMachineOptions } from "./run-types.js";
import {
	isJSONataString,
	JSONATA,
	JSONPATH,
	type MapState,
	type QueryLanguageIdentifier,
	type StateIdentifier,
} from "./sfn-types.js";

/**
 * Try to figure out the configured maximum concurrency for a Map State.
 * @see {@link https://states-language.net/#map-state-concurrency | Map State concurrency}
 */
export const getMaxConcurrency = async (
	context: {
		assertionBuilder: (fieldName: string, stateName: string) => EvaluationAssertion<number>;
		input: JSONSerializable;
		language: QueryLanguageIdentifier;
		options: RunStateMachineOptions;
		state: MapState;
		stateName: StateIdentifier;
	},
): Promise<number> => {
	const { assertionBuilder, input, language, state, stateName } = context;
	const present = [ "MaxConcurrency", "MaxConcurrencyPath" ].filter((k) => state[ k as keyof MapState ] != null);
	if (present.length > 1) {
		throw new SyntaxError(`Map state may have only 1 of: ${ present.join(" ") }`);
	}
	let max: number;
	if (present.length === 1) {
		if (hasNumber(state, "MaxConcurrency")) {
			max = state.MaxConcurrency;
		} else if (hasOwn(state, "MaxConcurrency", isJSONataString)) {
			assertLanguage(language, JSONATA, "MaxConcurrency");
			max = await evaluateJSONata(state.MaxConcurrency, { input, state }, assertionBuilder("MaxConcurrency", stateName));
		} else if (hasString(state, "MaxConcurrencyPath")) {
			assertLanguage(language, JSONPATH, "MaxConcurrencyPath");
			max = evaluateJSONPath(state.MaxConcurrencyPath, context, assertionBuilder("MaxConcurrencyPath", stateName));
		} else {
			throw new SyntaxError(`Map state has malformed ${ present[ 0 ] }`);
		}
	} else {
		/**
		 * Its default value is zero, which places no limit on invocation parallelism and requests the interpreter to execute the iterations as concurrently as possible.
		 * A MaxConcurrency value of 1 is special, having the effect that interpreter will invoke the ItemProcessor once for each array element in the order of their appearance in the input, and will not start an iteration until the previous iteration has completed execution.
		 */
		max = 0;
	}
	return max;
};
