import { describe, it } from "mocha";
import { expect } from "chai";
import { assertInt, expectInt, isDigit, isInt, maybeInt } from "../is-int.js";

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

describe(maybeInt.name, () => {
	it("accepts just digits", () => {
		expect(maybeInt("12345"), "positive").eq(12345);
		expect(maybeInt("-54321"), "negative").eq(-54321);
	});
	it("is lenient about a trailing radix point and zero", () => {
		expect(maybeInt("12345."), "positive").eq(12345);
		expect(maybeInt("-54321,"), "negative").eq(-54321);
	});
	it("accepts some group separators", () => {
		expect(maybeInt("12_345"), "positive").eq(12345);
		expect(maybeInt("-54 321"), "negative").eq(-54321);
	});
	it("accepts zero", () => {
		expect(maybeInt("0"), "positive").eq(0);
		expect(maybeInt("0."), "positive").eq(0);
		expect(maybeInt("0.0"), "positive").eq(0);
		expect(maybeInt("-0"), "negative").eq(-0);
		expect(maybeInt("-0.0"), "negative").eq(-0);
	});
	it("allows for some EU combos", () => {
		expect(maybeInt("1.234.567'00"), "Spain").eq(1234567);
		expect(maybeInt("1'234'567,0"), "Switzerland 1").eq(1234567);
		expect(maybeInt("1'234'567.000"), "Switzerland 2").eq(1234567);
		expect(maybeInt("1 234 567."), "Bangladesh").eq(1234567);
		expect(maybeInt("1,234,567·0"), "Singapore").eq(1234567);
		expect(maybeInt("1.234.567,00"), "Austria").eq(1234567);
		expect(maybeInt("1 234 567,000"), "Brazil").eq(1234567);
		expect(maybeInt("1 234 567.0000"), "Canada").eq(1234567);
	});
	it("is undefined for non- or ambiguous ints", () => {
		expect(maybeInt("nope"), "nope").eq(undefined);
		expect(maybeInt("4,000"), "nope").eq(undefined);
	});
});

describe(isDigit.name, () => {
	it("accepts numbers", () => {
		[ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map(String).forEach((digit) => {
			expect(isDigit(digit), digit).eq(true);
		});
	});
	it("rejects everything else", () => {
		[ "/", ":", "00", "99" ].forEach((nonDigit) => {
			expect(isDigit(nonDigit), nonDigit).eq(false);
		});
	});
});
