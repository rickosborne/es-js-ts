import { expect } from "chai";
import { describe, it, test } from "mocha";
import { evaluateIntrinsicFunction, type IntrinsicFunctionCall, parseIntrinsicFunctionExpression } from "../intrinsic-function.js";
import { STATES_ARRAY, STATES_ARRAY_CONTAINS, STATES_ARRAY_GET_ITEM, STATES_ARRAY_LENGTH, STATES_ARRAY_PARTITION, STATES_ARRAY_RANGE, STATES_ARRAY_UNIQUE, STATES_BASE64_DECODE, STATES_BASE64_ENCODE, STATES_FORMAT, STATES_HASH, STATES_JSON_MERGE, STATES_JSON_TO_STRING, STATES_MATH_ADD, STATES_MATH_RANDOM, STATES_STRING_SPLIT, STATES_STRING_TO_JSON, STATES_UUID } from "../sfn-types.js";
import { StatesError } from "../states-error.js";

describe("intrinsic-function", () => {
	describe(parseIntrinsicFunctionExpression.name, () => {
		test("JSONPath expressions", () => {
			expect(parseIntrinsicFunctionExpression("States.Format('Welcome to {} {}\\'s playlist.', $.firstName, $.lastName)")).eql({
				args: [
					{ type: "literal", value: "Welcome to {} {}'s playlist." },
					{ type: "path", value: "$.firstName" },
					{ type: "path", value: "$.lastName" },
				],
				fnName: "States.Format",
				type: "call",
			} satisfies IntrinsicFunctionCall);
		});
		it("throws for extra garbage", () => {
			expect(() => parseIntrinsicFunctionExpression("States.Format() garbage")).throws(StatesError, "garbage");
		});
	});

	describe(evaluateIntrinsicFunction.name, () => {
		test("path expressions", () => {
			expect(evaluateIntrinsicFunction("States.Format('Welcome to {} {}\\'s playlist.', $.firstName, $.lastName)", { firstName: "Quinn", lastName: "Hunter" })).eq("Welcome to Quinn Hunter's playlist.");
		});

		test("context object", () => {
			expect(evaluateIntrinsicFunction("States.Format('Today is {}', $$.DayOfWeek)", {}, { DayOfWeek: "TUESDAY" })).eq("Today is TUESDAY");
		});
	});

	test(STATES_FORMAT, () => {
		expect(evaluateIntrinsicFunction("States.Format('Your name is {}, we are in the year {}', $.name, 2020)", {
				name: "Foo",
				zebra: "stripe",
			},
		)).eql("Your name is Foo, we are in the year 2020");
	});

	test(STATES_STRING_TO_JSON, () => {
		expect(evaluateIntrinsicFunction("States.StringToJson($.someString)", {
				someString: "{\"number\": 20}",
				zebra: "stripe",
			},
		)).eql({ number: 20 });
	});

	test(STATES_JSON_TO_STRING, () => {
		expect(evaluateIntrinsicFunction("States.JsonToString($.someJson)", {
				someJson: {
					name: "Foo",
					year: 2020,
				},
				zebra: "stripe",
			},
		)).eql('{"name":"Foo","year":2020}');
	});

	test("json symmetry", () => {
		const someJson = {
			name: "Foo",
			year: 2020,
		};
		// This is not in the spec, but it tests for the ability to nest calls.
		expect(evaluateIntrinsicFunction("States.StringToJson(States.JsonToString($.someJson))", {
				someJson,
				zebra: "stripe",
			},
		)).eql(someJson);
	});

	test(STATES_ARRAY, () => {
		expect(evaluateIntrinsicFunction("States.Array('Foo', 2020, $.someJson, null)", {
				someJson: {
					random: "abcdefg",
				},
				zebra: "stripe",
			},
		)).eql([ "Foo", 2020, { random: "abcdefg" }, null ]);
		expect(evaluateIntrinsicFunction("States.Array()", {})).eql([]);
	});

	test(STATES_ARRAY_PARTITION, () => {
		expect(evaluateIntrinsicFunction("States.ArrayPartition($.inputArray,4)", { inputArray: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] })).eql([ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9 ] ]);
	});

	test(STATES_ARRAY_CONTAINS, () => {
		expect(evaluateIntrinsicFunction("States.ArrayContains($.inputArray, $.lookingFor)", { inputArray: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], lookingFor: 5 })).eq(true);
	});

	test(STATES_ARRAY_RANGE, () => {
		expect(evaluateIntrinsicFunction("States.ArrayRange(1, 9, 2)", {})).eql([ 1, 3, 5, 7, 9 ]);
	});

	test(STATES_ARRAY_GET_ITEM, () => {
		expect(evaluateIntrinsicFunction("States.ArrayGetItem($.inputArray, $.index)", { inputArray: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], index: 5 })).eq(6);
	});

	test(STATES_ARRAY_LENGTH, () => {
		expect(evaluateIntrinsicFunction("States.ArrayLength($.inputArray)", { inputArray: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] })).eq(9);
	});

	test(STATES_ARRAY_UNIQUE, () => {
		expect(evaluateIntrinsicFunction("States.ArrayUnique($.inputArray)", { inputArray: [ 1, 2, 3, 3, 3, 3, 3, 3, 4 ] })).eql([ 1, 2, 3, 4 ]);
	});

	test(STATES_BASE64_ENCODE, () => {
		expect(evaluateIntrinsicFunction("States.Base64Encode($.input)", { input: "Data to encode" })).eq("RGF0YSB0byBlbmNvZGU=");
	});

	test(STATES_BASE64_DECODE, () => {
		/**
		 * This is a bug in the spec.  The original value was:
		 * `"Decoded data"`
		 */
		expect(evaluateIntrinsicFunction("States.Base64Decode($.base64)", { base64: "RGF0YSB0byBlbmNvZGU=" })).eq("Data to encode");
	});

	test(STATES_HASH, () => {
		/**
		 * This is a bug in the spec.  The original value was:
		 * `"aaff4a450a104cd177d28d18d7485e8cae074b7"`
		 */
		expect(evaluateIntrinsicFunction("States.Hash($.Data, $.Algorithm)", { Data: "input data", Algorithm: "SHA-1" })).eq("aaff4a450a104cd177d28d18d74485e8cae074b7");
	});

	test(STATES_JSON_MERGE, () => {
		expect(evaluateIntrinsicFunction("States.JsonMerge($.json1, $.json2, false)", {
				json1: { a: { a1: 1, a2: 2 }, b: 2 },
				json2: { a: { a3: 1, a4: 2 }, c: 3 },
			},
		)).eql({ a: { a3: 1, a4: 2 }, b: 2, c: 3 });
	});

	test(STATES_MATH_RANDOM, () => {
		/**
		 * The spec does not specify whether the `end` number
		 * is inclusive or exclusive.  For now, this implementation
		 * assumes "array index" logic will be the primary use, and
		 * so treats it as exclusive.
		 */
		expect(evaluateIntrinsicFunction("States.MathRandom($.start, $.end)", { start: 1, end: 999 })).is.a("number").gte(1).lt(999);
		/**
		 * As the spec does not specify a specific RNG, there are
		 * no tests for seeded responses in the spec.
		 */
		expect(evaluateIntrinsicFunction("States.MathRandom($.start, $.end, 12345)", { start: 1, end: 999 })).eq(606);
	});

	test(STATES_MATH_ADD, () => {
		expect(evaluateIntrinsicFunction("States.MathAdd($.value1, $.step)", { value1: 111, step: -1 })).eq(110);
	});

	test(STATES_STRING_SPLIT, () => {
		expect(evaluateIntrinsicFunction("States.StringSplit($.inputString, $.splitter)", { inputString: "1,2,3,4,5", splitter: "," })).eql([ "1","2","3","4","5" ]);
	});

	test(STATES_UUID, () => {
		expect(evaluateIntrinsicFunction("States.UUID()")).matches(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89AB][a-f0-9]{3}-[a-f0-9]{12}$/i);
	});
});
