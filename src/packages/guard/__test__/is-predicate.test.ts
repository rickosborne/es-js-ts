import { describe, it } from "mocha";
import { expect } from "chai";
import { isUnaryPredicate } from "../is-predicate.js";

describe(isUnaryPredicate.name, () => {
	it("fails for non-functions", () => {
		expect(isUnaryPredicate(null)).eq(false);
		expect(isUnaryPredicate(123)).eq(false);
		expect(isUnaryPredicate("abc")).eq(false);
		expect(isUnaryPredicate(undefined)).eq(false);
		expect(isUnaryPredicate({})).eq(false);
		expect(isUnaryPredicate([])).eq(false);
	});
	it("fails for a no-arg function and lambda", () => {
		expect(isUnaryPredicate(() => {
			throw new Error("should never be called");
		})).eq(false);
		expect(isUnaryPredicate(function nope() {
			throw new Error("should never be called");
		})).eq(false);
	});
	it("succeeds for single-arg function and lambda", () => {
		expect(isUnaryPredicate((arg: unknown) => {
			throw new Error(String(arg));
		})).eq(true);
		expect(isUnaryPredicate(function whatever(arg: unknown) {
			throw new Error(String(arg));
		})).eq(true);
	});
	it("succeeds for dual-arg function and lambda", () => {
		expect(isUnaryPredicate((a: unknown, b: unknown) => {
			throw new Error(String(a).concat(String(b)));
		})).eq(true);
		expect(isUnaryPredicate(function whatever(a: unknown, b: unknown) {
			throw new Error(String(a).concat(String(b)));
		})).eq(true);
	});
});
