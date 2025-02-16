import { assertJSONSerializable, isJSONSerializable } from "@rickosborne/guard";
import type { JSONObject, JSONSerializable } from "@rickosborne/typical";
import * as jsonataModule from "jsonata";
import { QueryEvaluationError } from "./query-evaluation-error.js";
import type { EvaluationAssertion } from "./run-types.js";
import type { ErrorOutput, JSONataString, State } from "./sfn-types.js";

const jsonata = (jsonataModule as unknown as { default: typeof jsonataModule }).default;

/**
 * Evaluate a JSONata expression in the context of a running State.
 */
export const evaluateJSONata = async <T extends JSONSerializable>(
	text: JSONataString,
	context: {
		contextObject?: JSONObject;
		input: JSONSerializable;
		output?: JSONSerializable | undefined;
		errorOutput?: ErrorOutput | undefined;
		state: State,
	},
	assertion?: EvaluationAssertion<T>,
): Promise<T> => {
	const expressionText = text.substring(2, text.length - 2).trim();
	const expression = jsonata(expressionText);
	const bindings = {
		...(typeof context.input === "object" ? context.input : {}),
		...(typeof context.output === "object" ? context.output : {}),
		states: {
			context: context.contextObject ?? {},
			input: context.input,
			...(context.errorOutput == null ? {} : { errorOutput: context.errorOutput }),
			...(context.output == null ? {} : { result: context.output }),
		},
	};
	const value: unknown = await expression.evaluate(context.input, bindings);
	if (!isJSONSerializable(value)) {
		throw new QueryEvaluationError(expressionText);
	}
	assertJSONSerializable(value);
	if (assertion != null && !assertion.predicate(value)) {
		throw new SyntaxError(`${ context.state.Type } state ${ assertion.stateName } ${ assertion.fieldName } JSONata expression must resolve to ${ assertion.expected }`);
	}
	return value as T;
};
