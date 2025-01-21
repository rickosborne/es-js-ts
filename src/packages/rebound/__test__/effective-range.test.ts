import { expect } from "chai";
import { describe, test } from "mocha";
import { effectiveRange } from "../effective-range.js";

describe(effectiveRange.name, () => {
	test("[0,5]", () => {
		expect(effectiveRange({ lower: 0, isLowerInc: true, upper: 5, isUpperInc: true, isInt: true }), "int").eq(5);
		expect(effectiveRange({ lower: 0, isLowerInc: true, upper: 5, isUpperInc: true, isInt: false }), "real").eq(5);
	});
	test("[0,5)", () => {
		expect(effectiveRange({ lower: 0, isLowerInc: true, upper: 5, isUpperInc: false, isInt: true }), "int").eq(4);
		expect(effectiveRange({ lower: 0, isLowerInc: true, upper: 5, isUpperInc: false, isInt: false }), "real").eq(5 - Number.MIN_VALUE);
	});
	test("(0,5]", () => {
		expect(effectiveRange({ lower: 0, isLowerInc: false, upper: 5, isUpperInc: true, isInt: true }), "int").eq(4);
		expect(effectiveRange({ lower: 0, isLowerInc: false, upper: 5, isUpperInc: true, isInt: false }), "real").eq(5 - Number.MIN_VALUE);
	});
	test("(0,5)", () => {
		expect(effectiveRange({ lower: 0, isLowerInc: false, upper: 5, isUpperInc: false, isInt: true }), "int").eq(3);
		expect(effectiveRange({ lower: 0, isLowerInc: false, upper: 5, isUpperInc: false, isInt: false }), "real").eq(5 - (2 * Number.MIN_VALUE));
	});
});
