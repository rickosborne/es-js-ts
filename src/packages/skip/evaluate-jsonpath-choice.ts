import { deepEquals, simpleStarMatch } from "@rickosborne/foundation";
import type { JSONSerializable } from "@rickosborne/typical";
import * as jsonpath from "jsonpath";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { expectJSONPath } from "./expect-jsonpath.js";
import type { RunStateMachineOptions } from "./run-types.js";
import { type ChoiceState, type DataTestExpressions, type DataTestLiteralExpressions, isAndExpression, isDataTestExpression, isDataTestLiteralExpressionKey, isNonTerminalState, isNotExpression, isOrExpression, type JSONPathChoiceRule, type StateIdentifier, toDataTestLiteralExpressionKey } from "./sfn-types.js";
import { isIsoDateTime } from "./timestamps.js";

const DATA_TEST_HANDLERS: Record<keyof DataTestLiteralExpressions, (left: JSONSerializable, right: JSONSerializable, input: JSONSerializable, jsonPath: string) => boolean> = {
	BooleanEquals: (left, right) => deepEquals(left, right),
	IsBoolean: (left, right) => right === (typeof left === "boolean"),
	IsNull: (left, right) => right === (left === null),
	IsNumeric: (left, right) => right === (typeof left === "number"),
	IsPresent: (_left, right, input, jsonPath) => right === (jsonpath.query(input, jsonPath).length > 0),
	IsString: (left, right) => right === (typeof left === "string"),
	IsTimestamp: (left, right) => right === isIsoDateTime(left),
	NumericEquals: (left, right) => typeof right === "number" && left === right,
	NumericGreaterThan: (left, right) => typeof right === "number" && typeof left === "number" && left > right,
	NumericGreaterThanEquals: (left, right) => typeof right === "number" && typeof left === "number" && left >= right,
	NumericLessThan: (left, right) => typeof right === "number" && typeof left === "number" && left < right,
	NumericLessThanEquals: (left, right) => typeof right === "number" && typeof left === "number" && left <= right,
	StringEquals: (left, right) => typeof right === "string" && left === right,
	StringGreaterThan: (left, right) => typeof right === "string" && typeof left === "string" && left.localeCompare(right) > 0,
	StringGreaterThanEquals: (left, right) => typeof right === "string" && typeof left === "string" && left.localeCompare(right) >= 0,
	StringLessThan: (left, right) => typeof right === "string" && typeof left === "string" && left.localeCompare(right) < 0,
	StringLessThanEquals: (left, right) => typeof right === "string" && typeof left === "string" && left.localeCompare(right) <= 0,
	StringMatches: (left, right) => typeof right === "string" && typeof left === "string" && simpleStarMatch(right, left),
	TimestampEquals: (left, right) => isIsoDateTime(right) && isIsoDateTime(left) && Date.parse(left) === Date.parse(right),
	TimestampGreaterThan: (left, right) => isIsoDateTime(right) && isIsoDateTime(left) && Date.parse(left) > Date.parse(right),
	TimestampGreaterThanEquals: (left, right) => isIsoDateTime(right) && isIsoDateTime(left) && Date.parse(left) >= Date.parse(right),
	TimestampLessThan: (left, right) => isIsoDateTime(right) && isIsoDateTime(left) && Date.parse(left) < Date.parse(right),
	TimestampLessThanEquals: (left, right) => isIsoDateTime(right) && isIsoDateTime(left) && Date.parse(left) <= Date.parse(right),
};

/**
 * Evaluate a Choice Rule in a JSONPath context.
 */
export const evaluateJSONPathChoice = async (
	choice: JSONPathChoiceRule,
	depth: number,
	context: {
		input: JSONSerializable;
		options: RunStateMachineOptions;
		state: ChoiceState;
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
		const exprName = exprNames[ 0 ]!;
		let fnName: keyof DataTestLiteralExpressions;
		const left: JSONSerializable = evaluateJSONPath(choice.Variable, context);
		let right: JSONSerializable;
		if (isDataTestLiteralExpressionKey(exprName)) {
			fnName = exprName;
			right = choice[ exprName ]!;
		} else {
			fnName = toDataTestLiteralExpressionKey(exprName);
			const jsonPath = expectJSONPath(choice[ exprName ]!, exprName);
			right = evaluateJSONPath(jsonPath, context);
		}
		if (right === undefined) {
			throw new SyntaxError(`State ${ stateName } Choice Rule with ${ exprName } must have a value`);
		}
		const handler = DATA_TEST_HANDLERS[ fnName ];
		if (handler == null) {
			throw new SyntaxError(`State ${ stateName } Choice Rule with ${ exprName } handler is unknown`);
		}
		return handler(left, right, input, choice.Variable);
	}
	throw new SyntaxError(`Unhandled JSONPath Choice Rule: ${ JSON.stringify(choice) }`);
};
