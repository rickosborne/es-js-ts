import { expect } from "chai";
import { describe, test } from "mocha";
import { deepMerge } from "../deep-merge.js";

describe(deepMerge.name, () => {
	test("non-objects", () => {
		expect(deepMerge(123, false)).eq(false);
		expect(deepMerge("abc", undefined)).eq(undefined);
		expect(deepMerge({ foo: "bar" }, null)).eq(null);
	});
	test("shallow objects", () => {
		expect(deepMerge({ foo: "abc" }, { bar: 123 })).eql({ bar: 123, foo: "abc" });
	});
	test("nested objects", () => {
		expect(deepMerge({ both: [ 1, 2, 3 ], foo: { bar: true, baz: "abc" }, left: true }, { both: undefined, foo: { bar: 123 }, left: true, right: false })).eql({ both: undefined, foo: { bar: 123, baz: "abc" }, left: true, right: false });
	});
});
