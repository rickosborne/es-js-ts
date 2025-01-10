import { describe, it } from "mocha";
import { expect } from "chai";
import { hasNumber } from "../has-number.js";

const testHasNumber = (input: unknown, key: string, expected: boolean): void => {
	expect(hasNumber(input, key)).eq(expected);
};

describe(hasNumber.name, () => {
	it("empty object", () => {
		testHasNumber({}, "a", false);
	});
	it("empty array", () => {
		testHasNumber({}, "a", false);
	});
	it("array length", () => {
		testHasNumber([], "length", true);
	});
	it("non-number", () => {
		testHasNumber({ x: "x" }, "x", false);
	});
	it("number", () => {
		testHasNumber({ x: 1 }, "x", true);
	});
	it("null", () => {
		testHasNumber({ x: 2, y: null }, "y", false);
	});
	it("undefined", () => {
		testHasNumber({ x: 2, y: undefined }, "y", false);
	});
});
