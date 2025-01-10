import { assertDefined, expectDefined, isDefined } from "../is-defined.js";
import { describe, it } from "mocha";
import { expect } from "chai";

describe(assertDefined.name, () => {
	it("throws for null", () => {
		expect(() => assertDefined(null, "null")).throws(RangeError);
	});
	it("throws for undefined", () => {
		expect(() => assertDefined(undefined, "undefined")).throws(RangeError);
	});
	it("doesn't throw when it's not supposed to", () => {
		expect(() => assertDefined(123, "number")).not.throws(RangeError);
		expect(() => assertDefined("abc", "string")).not.throws(RangeError);
		expect(() => assertDefined(false, "boolean")).not.throws(RangeError);
	});
	it("can throw a custom error", () => {
		class CustomError extends Error {
		}
		expect(() => assertDefined(null, () => new CustomError("null"))).throws(CustomError, "null");
		expect(() => assertDefined(null, new CustomError("null"))).throws(CustomError, "null");
	});
	it("can use custom message", () => {
		expect(() => assertDefined(undefined, "undefined")).throws(RangeError, "undefined");
		expect(() => assertDefined(undefined, () => "undefined")).throws(RangeError, "undefined");
	});
});

describe(isDefined.name, () => {
	it("is false for null", () => {
		expect(isDefined(null)).eq(false);
	});
	it("is false for undefined", () => {
		expect(isDefined(undefined)).eq(false);
	});
	it("is true for other things", () => {
		expect(isDefined({})).eq(true);
		expect(isDefined([])).eq(true);
		expect(isDefined(NaN)).eq(true);
		expect(isDefined(Infinity)).eq(true);
		expect(isDefined(0)).eq(true);
		expect(isDefined(false)).eq(true);
	});
});

describe(expectDefined.name, () => {
	it("passes through for defined values", () => {
		expect(expectDefined(123, "123")).eq(123);
	});
	it("throws for null", () => {
		expect(() => expectDefined(null, "null")).throws(RangeError);
	});
	it("throws for undefined", () => {
		expect(() => expectDefined(undefined, "undefined")).throws(RangeError);
	});
});
