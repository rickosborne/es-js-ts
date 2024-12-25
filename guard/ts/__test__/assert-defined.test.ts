import { assertDefined } from "../assert-defined.js";
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
