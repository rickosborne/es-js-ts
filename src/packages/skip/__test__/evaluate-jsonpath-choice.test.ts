import type { JSONObject, JSONSerializable } from "@rickosborne/typical";
import { expect } from "chai";
import { describe, test } from "mocha";
import { evaluateJSONPathChoice } from "../evaluate-jsonpath-choice.js";
import type { RunStateMachineOptions } from "../run-types.js";
import { type ChoiceRule, type DataTestLiteralExpressions, JSONPATH, type JSONPathChoiceRule, type JSONPathChoiceState, TYPE_CHOICE } from "../sfn-types.js";
import { isIsoDate, isIsoDateTime } from "../timestamps.js";

describe(evaluateJSONPathChoice.name, () => {
	type TestInput =
		| [ left: JSONSerializable, right: JSONSerializable ]
		| [ left: JSONSerializable, right: JSONSerializable, input: JSONObject ];

	interface TestSetup {
		fail: TestInput[];
		pass: TestInput[];
	}

	const isoDate = "2024-02-29";
	const isoZulu = `${isoDate}T01:23:45.6789Z`;
	const isoPDT = `${isoDate}T01:23:45.6789-08:00`;
	const isoPZ = `${isoDate}T09:23:45.6789Z`;

	test("timestamps", () => {
		expect(isIsoDate(isoDate), "isIsoDate(isoDate)").eq(true);
		expect(isIsoDateTime(isoDate), "isIsoDateTime(isoDate)").eq(true);
		expect(isIsoDateTime(isoZulu), "isIsoDateTime(isoZulu)").eq(true);
		expect(isIsoDateTime(isoPDT), "isIsoDateTime(isoPDT)").eq(true);
	});

	const exprTests: Record<keyof DataTestLiteralExpressions, TestSetup> = {
		BooleanEquals: {
			fail: [ [ 5, 1 ], [ 5, "5" ] ],
			pass: [ [ 3, 3 ], [ "a", "a" ], [ { foo: 2 }, { foo: 2 } ] ],
		},
		IsBoolean: {
			fail: [ [ 1, true ], [ true, false ] ],
			pass: [ [ true, true ], [ false, true ], [ 5, false ] ],
		},
		IsNull: {
			fail: [ [ 1, true ], [ null, false ] ],
			pass: [ [ null, true ], [ 5, false ] ],
		},
		IsNumeric: {
			fail: [ [ "a", true ], [ 1, false ] ],
			pass: [ [ 3, true ], [ "b", false ] ],
		},
		IsPresent: {
			fail: [ [ 1, false ], [ 2, true, { right: true } ] ],
			pass: [ [ null, true ], [ 2, false, { right: false } ] ],
		},
		IsString: {
			fail: [ [ 1, true ], [ "a", false ] ],
			pass: [ [ "a", true ], [ 2, false ] ],
		},
		IsTimestamp: {
			fail: [ [ 1, true ], [ isoDate, false ], [ isoPDT, false ], [ isoZulu, false ] ],
			pass: [ [ 1, false ], [ isoDate, true ], [ isoPDT, true ], [ isoZulu, true ] ],
		},
		NumericEquals: {
			fail: [ [ 1, 2 ], [ "a", 5 ], [ 2, "b" ] ],
			pass: [ [ 3.5, 3.5 ], [ 0, 0 ] ],
		},
		NumericGreaterThan: {
			fail: [ [ 1, 2 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ] ],
			pass: [ [ 5, 3 ], [ 0, -1 ] ],
		},
		NumericGreaterThanEquals: {
			fail: [ [ 1, 2 ], [ "a", 5 ], [ 2, "b" ], [ "c", "c" ] ],
			pass: [ [ 5, 3 ], [ 0, -1 ], [ 3, 3 ] ],
		},
		NumericLessThan: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ 3, 3 ], [ "a", 5 ], [ 2, "b" ], [ "c", "c" ] ],
			pass: [ [ 1, 2 ], [ -1, 1 ] ],
		},
		NumericLessThanEquals: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ "c", "c" ] ],
			pass: [ [ 1, 2 ], [ -1, 1 ], [ 3, 3 ] ],
		},
		StringEquals: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ] ],
			pass: [ [ "c", "c" ], [ "", "" ] ],
		},
		StringGreaterThan: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ], [ "c", "c" ] ],
			pass: [ [ "c", "b" ], [ "a", "" ] ],
		},
		StringGreaterThanEquals: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ] ],
			pass: [ [ "c", "b" ], [ "a", "" ], [ "c", "c" ] ],
		},
		StringLessThan: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ], [ "c", "c" ] ],
			pass: [ [ "b", "c" ], [ "", "a" ] ],
		},
		StringLessThanEquals: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ] ],
			pass: [ [ "b", "c" ], [ "", "a" ], [ "c", "c" ] ],
		},
		StringMatches: {
			fail: [ [ 5, 3 ], [ 0, -1 ], [ "a", 5 ], [ 2, "b" ], [ 3, 3 ], [ "foo", "e*" ], [ "bar", "*f" ] ],
			pass: [ [ "c", "c" ], [ "car", "c*" ], [ "c", "*c" ], [ "ace", "*c*" ], [ "did", "d*d" ] ],
		},
		TimestampEquals: {
			fail: [ [ 3, 3 ], [ "a", "a" ], [ isoDate, isoPDT ], [ isoPDT, isoZulu ] ],
			/**
			 * The spec does not say whether "equals" here includes the timezone offset.
			 * This implementation assumes most people will care less about the specific
			 * timezone, and more about "do these timestamps resolve to the same time?".
			 */
			pass: [ [ isoDate, isoDate ], [ isoZulu, isoZulu ], [ isoPDT, isoPZ ] ],
		},
		TimestampGreaterThan: {
			fail: [ [ 3, 3 ], [ "a", "a" ], [ isoDate, isoPDT ], [ isoZulu, isoPDT ], [ isoPDT, isoPZ ] ],
			pass: [ [ isoPDT, isoZulu ], [ isoZulu, isoDate ] ],
		},
		TimestampGreaterThanEquals: {
			fail: [ [ 3, 3 ], [ "a", "a" ], [ isoDate, isoPDT ], [ isoZulu, isoPDT ] ],
			pass: [ [ isoPDT, isoZulu ], [ isoZulu, isoDate ], [ isoPDT, isoPZ ] ],
		},
		TimestampLessThan: {
			fail: [ [ 3, 3 ], [ "a", "a" ], [ isoPDT, isoZulu ], [ isoZulu, isoDate ], [ isoPDT, isoPZ ] ],
			pass: [ [ isoDate, isoPDT ], [ isoZulu, isoPDT ] ],
		},
		TimestampLessThanEquals: {
			fail: [ [ 3, 3 ], [ "a", "a" ], [ isoPDT, isoZulu ], [ isoZulu, isoDate ] ],
			pass: [ [ isoDate, isoPDT ], [ isoZulu, isoPDT ], [ isoPDT, isoPZ ] ],
		},
	};

	const testChoice = async (key: keyof DataTestLiteralExpressions, left: JSONSerializable, right: JSONSerializable, input: JSONObject | undefined, expected: boolean): Promise<void> => {
		const directRule = {
			Variable: "$.left",
			[ key ]: right,
		} as unknown as JSONPathChoiceRule;
		const pathRule = {
			Variable: "$.left",
			[ `${ key }Path` ]: "$.right",
		} as unknown as JSONPathChoiceRule;
		const choiceState: JSONPathChoiceState = {
			Choices: [ directRule as ChoiceRule, pathRule as ChoiceRule ],
			Type: TYPE_CHOICE,
		};
		const context = {
			input: input ?? {
				left,
				right,
			},
			options: { language: JSONPATH } as RunStateMachineOptions,
			state: choiceState,
			stateName: `Test${ key }`,
		};
		const directResult = await evaluateJSONPathChoice(directRule, 1, context);
		expect(directResult, "direct").eq(expected);
		const pathResult = await evaluateJSONPathChoice(pathRule, 1, context);
		expect(pathResult, "path").eq(expected);
	};

	Object.entries(exprTests).forEach(([ key, {
			fail,
			pass } ]) => {
		describe(key, () => {
			const fnName = key as keyof DataTestLiteralExpressions;
			for (const [ left, right, input ] of fail) {
				test(`!${ fnName }(${ JSON.stringify(left) }, ${ JSON.stringify(right) }${ input == null ? "" : ", ".concat(JSON.stringify(input)) })`, async () => {
					await testChoice(fnName, left, right, input, false);
				});
			}
			for (const [ left, right, input ] of pass) {
				test(`${ fnName }(${ JSON.stringify(left) }, ${ JSON.stringify(right) }${ input == null ? "" : ", ".concat(JSON.stringify(input)) })`, async () => {
					await testChoice(fnName, left, right, input, true);
				});
			}
		});
	});
});
