import type { QueryLanguageIdentifier } from "./sfn-types.js";

/**
 * Throw if the current actual language (in the context of the state)
 * is not the expected language (based on the attempted operation).
 */
export function assertLanguage<Q extends QueryLanguageIdentifier>(actual: QueryLanguageIdentifier, expected: Q, fieldName: string): asserts actual is Q {
	if (actual !== expected) {
		throw new SyntaxError(`The ${ fieldName } expression is only valid in a ${ expected } context.`);
	}
}
