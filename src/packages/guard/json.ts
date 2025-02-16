import type { JSONArray, JSONObject, JSONPrimitive, JSONSerializable } from "@rickosborne/typical";
import { ValidationError, type ValidationProblem } from "./validate.js";

/**
 * Try to validate the given value could be serialized as a JSON Object
 * without losing information.  An empty result array means the value
 * is a valid JSON Object.
 */
export function validateJSONObject(
	value: unknown,
	seen: Map<unknown, ValidationProblem[]> = new Map<unknown, ValidationProblem[]>(),
	path: string[] = [],
): ValidationProblem[] {
	if (seen.has(value)) {
		return seen.get(value)!;
	}
	const problems: ValidationProblem[] = [];
	seen.set(value, problems);
	if (value === null) {
		problems.push({ path, expectedType: "JSONObject", actualType: "null" });
	} else if (value === undefined) {
		problems.push({ path, expectedType: "JSONObject", actualType: "undefined" });
	} else if (typeof value !== "object") {
		problems.push({ path, expectedType: "JSONObject", actualType: typeof value });
	} else if (Array.isArray(value)) {
		problems.push({ path, expectedType: "JSONObject", actualType: "array" });
	} else if (Object.getOwnPropertySymbols(value).length > 0) {
		problems.push({ path, expectedType: "JSONObject", actualType: "object", message: "JSONObject must not have Symbol keys" });
	} else {
		const subProblems = Object.entries(value).flatMap(([ k, v ]) => validateJSONSerializable(v, seen, path.concat(k)));
		subProblems.forEach((problem) => problems.push(problem));
	}
	return problems;
}

/**
 * Type guard for values which could be serialized as JSON Objects.
 */
export function isJSONObject(
	value: unknown,
): value is JSONObject {
	return validateJSONObject(value).length === 0;
}

/**
 * Try to validate the given value's items could be serialized as a
 * JSON Array without losing information.  An empty result array
 * implies the value is a valid JSON Array.
 */
export function validateJSONArray(
	value: unknown,
	seen: Map<unknown, ValidationProblem[]> = new Map<unknown, ValidationProblem[]>(),
	path: string[] = [],
): ValidationProblem[] {
	if (seen.has(value)) {
		return seen.get(value)!;
	}
	const problems: ValidationProblem[] = [];
	seen.set(value, problems);
	if (value === null) {
		problems.push({ path, expectedType: "JSONArray", actualType: "null" });
	} else if (value === undefined) {
		problems.push({ path, expectedType: "JSONArray", actualType: "undefined" });
	} else if (typeof value !== "object") {
		problems.push({ path, expectedType: "JSONArray", actualType: typeof value });
	} else if (!Array.isArray(value)) {
		problems.push({ path, expectedType: "JSONArray", actualType: "object" });
	} else {
		const subProblems = value.flatMap((v, n) => validateJSONSerializable(v, seen, path.concat(`[${n}]`)));
		subProblems.forEach((problem) => problems.push(problem));
	}
	return problems;
}

/**
 * Type guard testing whether the value could be serialized as a JSON
 * Array without losing information.
 */
export function isJSONArray(
	value: unknown,
): value is JSONArray {
	return validateJSONArray(value).length === 0;
}

/**
 * Try to validate the given value could be serialized as a JSON literal
 * primitive without losing information.  An empty result array implies
 * the value is a valid JSON primitive.
 */
export function validateJSONPrimitive(
	value: unknown,
	path: string[] = [],
): ValidationProblem[] {
	if (typeof value === "string" || typeof value === "boolean" || value === null) {
		return [];
	}
	if (value === undefined) {
		return [ { path, expectedType: "JSONPrimitive", actualType: "undefined", message: "JSON cannot use undefined as a value" } ];
	}
	if (typeof value === "number") {
		if (!Number.isFinite(value)) {
			return [ { path, expectedType: "JSONPrimitive", actualType: "Infinity", message: "JSON cannot use Infinity as a value" } ];
		}
		if (Number.isNaN(value)) {
			return [ { path, expectedType: "JSONPrimitive", actualType: "NaN", message: "JSON cannot use NaN as a value" } ];
		}
		return [];
	}
	return [ { path, expectedType: "JSONPrimitive", actualType: typeof value } ];
}

/**
 * Type guard validating the value could be serialized as a JSON primitive.
 */
export function isJSONPrimitive(value: unknown): value is JSONPrimitive {
	return validateJSONPrimitive(value).length === 0;
}

/**
 * Try to validate that the given value could be serialized correctly
 * as JSON without losing information.  An empty result array implies
 * the value is valid JSON.
 */
export function validateJSONSerializable(
	value: unknown,
	seen: Map<unknown, ValidationProblem[]> = new Map<unknown, ValidationProblem[]>(),
	path: string[] = [],
): ValidationProblem[] {
	if (value === undefined) {
		return [ { path, expectedType: "JSONSerializable", actualType: "undefined" } ];
	}
	if (seen.has(value)) {
		return seen.get(value)!;
	}
	if (Array.isArray(value)) {
		return validateJSONArray(value, seen, path);
	}
	if (value != null && typeof value === "object") {
		return validateJSONObject(value, seen, path);
	}
	if (isJSONPrimitive(value)) {
		return [];
	}
	return [ { path, expectedType: "JSONSerializable", actualType: typeof value } ];
}

/**
 * Type guard for any value which could be serialized natively as JSON.
 */
export function isJSONSerializable(
	value: unknown,
): value is JSONSerializable {
	return validateJSONSerializable(value).length === 0;
}

/**
 * Assert the given value could be serialized as a JSON Object.
 */
export function assertJSONObject(
	value: unknown,
): asserts value is JSONObject {
	const problems = validateJSONObject(value);
	if (problems.length > 0) {
		throw new ValidationError(problems as [ValidationProblem, ...ValidationProblem[]]);
	}
}

/**
 * Assert the given value could be serialized as a JSON Array.
 */
export function assertJSONArray(
	value: unknown,
): asserts value is JSONArray {
	const problems = validateJSONArray(value);
	if (problems.length > 0) {
		throw new ValidationError(problems as [ValidationProblem, ...ValidationProblem[]]);
	}
}

/**
 * Assert the given value could be serialized as a JSON Primitive.
 */
export function assertJSONPrimitive(
	value: unknown,
): asserts value is JSONPrimitive {
	const problems = validateJSONPrimitive(value);
	if (problems.length > 0) {
		throw new ValidationError(problems as [ValidationProblem, ...ValidationProblem[]]);
	}
}

/**
 * Assert the given value could be serialized as JSON.
 */
export function assertJSONSerializable(
	value: unknown,
): asserts value is JSONSerializable {
	const problems = validateJSONSerializable(value);
	if (problems.length > 0) {
		throw new ValidationError(problems as [ValidationProblem, ...ValidationProblem[]]);
	}
}
