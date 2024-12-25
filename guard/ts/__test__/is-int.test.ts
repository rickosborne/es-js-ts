import { describe, it } from "mocha";
import { expect } from "chai";
import { assertInt, expectInt, isInt } from "../is-int.js";

const testIsInt = (expected: boolean, ...values: unknown[]): void => {
	for (const value of values) {
		const label = JSON.stringify(value) ?? "undefined";
		expect(isInt(value), label).eq(expected);
		if (expected) {
			expect(() => assertInt(value, label), label).not.throws(TypeError);
			expect(expectInt(value, label)).eq(value);
		} else {
			expect(() => assertInt(value, label), label).throws(TypeError);
			expect(() => expectInt(value, label)).throws(TypeError);
		}
	}
};

describe(isInt.name, () => {
	it("is true for ints", () => {
		testIsInt(true, 10, 0, -0, -10);
	});
	it("is false for number-like things", () => {
		testIsInt(false, NaN, Infinity, -Infinity);
	});
	it("is false for floats", () => {
		testIsInt(false, 1.0002, -2.00001);
	});
});
