import { describe, it } from "mocha";
import { expect } from "chai";
import { isObject, isPlainObject, notPlainObject } from "../is-object.js";

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
	it("returns false for notPlainObject", () => {
		expect(isPlainObject({ [notPlainObject]: null })).eq(false);
		const empty = {};
		expect(isPlainObject(empty), "empty before").eq(true);
		Object.defineProperty(empty, notPlainObject, { enumerable: false, value: null });
		expect(isPlainObject(empty), "empty after").eq(false);
		expect(empty).eql({});
		const original = { abc: 123 };
		expect(isPlainObject(original)).eq(true);
		const proxy = new Proxy(original, {
			get(target: object, p: string | symbol, receiver: unknown): unknown {
				expect(target, "target").eq(original);
				expect(receiver, "receiver").eq(proxy);
				if (p === notPlainObject) {
					return notPlainObject;
				}
				return Reflect.get(target, p);
			},
		});
		expect(proxy).eql(original);
		expect(isPlainObject(proxy)).eq(false);
	});
});
