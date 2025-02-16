import { isInt } from "@rickosborne/guard";
import type { JSONArray } from "@rickosborne/typical";
import type { EvaluationAssertion } from "./run-types.js";
import type { StateIdentifier } from "./sfn-types.js";

/**
 * Builder for an evaluation assertion for a positive integer.
 */
export const positiveIntAssertion = (fieldName: string, stateName: StateIdentifier): EvaluationAssertion<number> => ({
	expected: "a positive integer",
	fieldName,
	predicate: (v): v is number => isInt(v) && v > 0,
	stateName,
});

/**
 * Builder for an evaluation assertion for an array.
 */
export const arrayAssertion = (fieldName: string, stateName: StateIdentifier): EvaluationAssertion<JSONArray> => ({
	expected: "an array",
	fieldName,
	predicate: (v): v is JSONArray => Array.isArray(v),
	stateName,
});

/**
 * Builder for an evaluation assertion for a string.
 */
export const stringAssertion = (fieldName: string, stateName: StateIdentifier): EvaluationAssertion<string> => ({
	expected: "a string",
	fieldName,
	predicate: (v) => typeof v === "string",
	stateName,
});
