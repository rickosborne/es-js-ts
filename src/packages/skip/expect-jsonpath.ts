import type { JSONSerializable } from "@rickosborne/typical";
import { assertString } from "./assert-string.js";
import { isJSONPathPath, type JSONPathPath } from "./sfn-types.js";

/**
 * Assert that a value is a JSONPath expression, and return it.
 */
export function expectJSONPath(value: JSONSerializable, name: string): JSONPathPath {
	assertString(value, (type) => new SyntaxError(`Expected JSONPath for ${ name }, found ${ type }`));
	if (!isJSONPathPath(value)) {
		throw new SyntaxError(`Expected JSONPath for ${ name }, found: ${ JSON.stringify(value) }`);
	}
	return value;
}
