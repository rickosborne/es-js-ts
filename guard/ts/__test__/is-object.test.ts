import { describe, it } from "mocha";
import { expect } from "chai";
import { isObject, isPlainObject } from "../is-object.js";

describe(isObject.name, () => {
	it("null", () => {
		expect(isObject(null)).eq(false);
	});
	it("undefined", () => {
		expect(isObject(undefined)).eq(false);
	});
	it("empty object", () => {
		expect(isObject({})).eq(true);
	});
	it("empty array", () => {
		expect(isObject([])).eq(true);
	});
	it("string", () => {
		expect(isObject("")).eq(false);
	});
});

describe(isPlainObject.name, () => {
	it("null", () => {
		expect(isPlainObject(null)).eq(false);
	});
	it("undefined", () => {
		expect(isPlainObject(undefined)).eq(false);
	});
	it("empty object", () => {
		expect(isPlainObject({})).eq(true);
	});
	it("empty array", () => {
		expect(isPlainObject([])).eq(false);
	});
	it("string", () => {
		expect(isPlainObject("")).eq(false);
	});
	it("anonymous class", () => {
		expect(isPlainObject(class {
		})).eq(false);
	});
	it("class instance", () => {
		expect(isPlainObject(new class {
		})).eq(false);
	});
});
