import { entriesOf } from "@rickosborne/foundation";
import { assertJSONSerializable } from "@rickosborne/guard";
import type { JSONObject, JSONSerializable } from "@rickosborne/typical";
import { assertString } from "./assert-string.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { evaluateIntrinsicFunction } from "./intrinsic-function.js";
import type { RunStateMachineOptions } from "./run-types.js";
import {
	type ErrorOutput,
	isJSONataString,
	isJSONPathInterpolated,
	JSONATA,
	type JSONataCatcher,
	JSONPATH,
	type JSONPathCatcher,
	type QueryLanguageIdentifier,
	type State,
} from "./sfn-types.js";

/**
 * Evaluate an expression, which may be a literal, JSONPath, or JSONata,
 * in the context of the current State.
 */
export const evaluateExpression = async (
	expr: JSONSerializable,
	context: {
		catcher?: JSONataCatcher | JSONPathCatcher | undefined;
		contextObject?: JSONObject,
		errorOutput?: ErrorOutput | undefined;
		input: JSONSerializable;
		language: QueryLanguageIdentifier;
		options: RunStateMachineOptions;
		state: State;
		stateStack: State[];
	},
): Promise<JSONSerializable> => {
	const { contextObject, input, language, options } = context;
	if (Array.isArray(expr)) {
		return Promise.all(expr.map((v) => evaluateExpression(v, context)));
	}
	if (typeof expr === "string") {
		if (language === JSONATA) {
			if (isJSONataString(expr)) {
				return evaluateJSONata(expr, context);
			}
		} else if (language === JSONPATH) {
			if (expr.startsWith("$")) {
				return evaluateJSONPath(expr, { contextOverride: context.contextObject, input, options });
			}
		}
		return expr;
	}
	if (expr == null || typeof expr === "boolean" || typeof expr === "number") {
		return expr;
	}
	const result: JSONObject = {};
	for await (const [ key, value ] of entriesOf(expr)) {
		let newValue: JSONSerializable;
		let assignedName = key;
		if (language === JSONPATH && isJSONPathInterpolated(key)) {
			assignedName = key.substring(0, key.length - 2);
			assertString(value, (type) => new SyntaxError(`Expected a JSONPath string for ${ key }, found ${ type }`));
			if (value.startsWith("$")) {
				newValue = evaluateJSONPath(value, { contextOverride: contextObject, input, options });
			} else {
				newValue = evaluateIntrinsicFunction(value, input, contextObject ?? options.contextObject);
			}
			if (Array.isArray(newValue) && newValue.length === 1) {
				newValue = newValue[ 0 ]!;
			}
			assertJSONSerializable(newValue);
		} else {
			newValue = await evaluateExpression(value, context);
		}
		if (assignedName === "states") {
			throw new Error("Cannot assign to a variable named 'states'");
		}
		result[ assignedName ] = newValue;
	}
	return result;
};
