import type { JSONObject, JSONSerializable } from "@rickosborne/typical";
import * as jsonpath from "jsonpath";
import type { RunStateMachineOptions } from "./run-types.js";
import type { StateIdentifier } from "./sfn-types.js";

/**
 * Evaluate a JSONPath expression in the context of the current State.
 */
export const evaluateJSONPath = <T extends JSONSerializable>(
	expression: string,
	context: {
		contextOverride?: JSONObject | undefined,
		input: JSONSerializable;
		options: RunStateMachineOptions;
	},
	assertion?: {
		expected: string;
		fieldName: string;
		predicate: (v: JSONSerializable) => v is T;
		stateName: StateIdentifier;
	},
): T => {
	const { contextOverride, input, options } = context;
	let expr: string;
	let target: JSONSerializable;
	if (expression.startsWith("$$")) {
		expr = expression.substring(1);
		target = contextOverride ?? options.contextObject ?? {};
	} else if (expression.startsWith("$")) {
		expr = expression;
		target = input;
	} else {
		throw new SyntaxError(`Expected a JSONPath expression: ${ JSON.stringify(expression) }`);
	}
	const values = jsonpath.query(target, expr) as JSONSerializable[];
	let value: JSONSerializable = values;
	if (values.length === 1) {
		value = values[ 0 ]!;
	}
	if (assertion != null && !assertion.predicate(value)) {
		throw new SyntaxError(`State ${ assertion.stateName } ${ assertion.fieldName } JSONPath must resolve to ${ assertion.expected }`);
	}
	return value as T;
};
