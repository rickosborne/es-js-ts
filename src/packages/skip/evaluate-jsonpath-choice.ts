import { deepEquals, simpleStarMatch } from "@rickosborne/foundation";
import type { JSONSerializable } from "@rickosborne/typical";
import * as jsonpath from "jsonpath";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { expectJSONPath } from "./expect-jsonpath.js";
import type { RunStateMachineOptions } from "./run-types.js";
import {
	type DataTestExpressions,
	isAndExpression,
	isDataTestExpression,
	isDataTestLiteralExpressionKey,
	isIsoDateTime,
	isNonTerminalState,
	isNotExpression,
	isOrExpression,
	type JSONPathChoiceRule,
	type State,
	type StateIdentifier,
	toDataTestLiteralExpressionKey,
} from "./sfn-types.js";

/**
 * Evaluate a Choice Rule in a JSONPath context.
 */
export const evaluateJSONPathChoice = async (
	choice: JSONPathChoiceRule,
	depth: number,
	context: {
		input: JSONSerializable;
		options: RunStateMachineOptions;
		state: State;
		stateName: StateIdentifier;
	},
): Promise<boolean> => {
	if (depth > 1 && isNonTerminalState(choice)) {
		throw new SyntaxError(`State ${ context.stateName } Choice Rules must have Next only at the top level`);
	}
	if (isNotExpression(choice)) {
		return !(await evaluateJSONPathChoice(choice.Not, depth + 1, context));
	}
	if (isAndExpression(choice)) {
		for await (const expr of choice.And) {
			const result = await evaluateJSONPathChoice(expr, depth + 1, context);
			if (!result) {
				return false;
			}
		}
		return true;
	}
	if (isOrExpression(choice)) {
		for await (const expr of choice.Or) {
			const result = await evaluateJSONPathChoice(expr, depth + 1, context);
			if (result) {
				return true;
			}
		}
		return false;
	}
	if (isDataTestExpression(choice)) {
		const { input, stateName } = context;
		const exprNames = Object.keys(choice).filter((k) => k !== "Variable" && k !== "Next") as (keyof DataTestExpressions)[];
		if (exprNames.length !== 1) {
			throw new SyntaxError(`State ${ stateName } Choice Rule must have exactly 1 Data Test Expression, found ${ exprNames.length === 0 ? "0" : exprNames.join(" ") }`);
		}
		let exprName = exprNames[ 0 ]!;
		const value: JSONSerializable = evaluateJSONPath(choice.Variable, context);
		let right = choice[ exprName ];
		if (right === undefined) {
			throw new SyntaxError(`State ${ stateName } Choice Rule with ${ exprName } must have a value`);
		}
		if (!isDataTestLiteralExpressionKey(exprName)) {
			exprName = toDataTestLiteralExpressionKey(exprName);
			right = evaluateJSONPath(expectJSONPath(right, "BooleanEqualsPath"), context);
		}
		// TODO: Pull this out into a static structure.
		switch (exprName) {
			case "BooleanEquals":
				return deepEquals(value, right);
			case "IsBoolean":
				return right === (typeof value === "boolean");
			case "IsNull":
				return right === (value === null);
			case "IsNumeric":
				return right === (typeof value === "number");
			case "IsPresent":
				return right === (jsonpath.query(input, choice.Variable).length > 0);
			case "IsString":
				return right === (typeof value === "string");
			case "IsTimestamp":
				return right === isIsoDateTime(value);
			case "NumericEquals":
				return typeof right === "number" && value === right;
			case "NumericGreaterThan":
				return typeof right === "number" && typeof value === "number" && value > right;
			case "NumericLessThan":
				return typeof right === "number" && typeof value === "number" && value < right;
			case "NumericLessThanEquals":
				return typeof right === "number" && typeof value === "number" && value <= right;
			case "NumericGreaterThanEquals":
				return typeof right === "number" && typeof value === "number" && value >= right;
			case "StringEquals":
				return typeof right === "string" && value === right;
			case "StringGreaterThan":
				return typeof right === "string" && typeof value === "string" && value.localeCompare(right) > 0;
			case "StringLessThan":
				return typeof right === "string" && typeof value === "string" && value.localeCompare(right) < 0;
			case "StringGreaterThanEquals":
				return typeof right === "string" && typeof value === "string" && value.localeCompare(right) >= 0;
			case "StringLessThanEquals":
				return typeof right === "string" && typeof value === "string" && value.localeCompare(right) <= 0;
			case "StringMatches":
				return typeof right === "string" && typeof value === "string" && simpleStarMatch(right, value);
			case "TimestampEquals":
				return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) === Date.parse(right);
			case "TimestampGreaterThan":
				return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) > Date.parse(right);
			case "TimestampGreaterThanEquals":
				return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) >= Date.parse(right);
			case "TimestampLessThan":
				return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) < Date.parse(right);
			case "TimestampLessThanEquals":
				return isIsoDateTime(right) && isIsoDateTime(value) && Date.parse(value) <= Date.parse(right);
			default: {
				throw new SyntaxError(`State ${ stateName } has unknown Data Test Expression: ${ JSON.stringify(exprName) }`);
			}
		}
	}
	throw new SyntaxError(`Unhandled JSONPath Choice Rule: ${ JSON.stringify(choice) }`);
};
