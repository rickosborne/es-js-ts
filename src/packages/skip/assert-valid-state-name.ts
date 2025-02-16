import type { StateIdentifier } from "./sfn-types.js";

/**
 * Basic check to ensure the State identifier meets the spec restrictions.
 */
export function assertValidStateName(name: string): asserts name is StateIdentifier {
	if (name.length > 80) {
		throw new SyntaxError(`State name should be <= 80 characters: ${ name }`);
	}
}
