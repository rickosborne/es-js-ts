import { describe, it } from "mocha";
import { expect } from "chai";
import { arrayEq } from "../array-eq.js";

describe(arrayEq.name, () => {
	it("fast-fails different lengths", () => {
		expect(arrayEq([ 1 ], [ 1, 2 ], () => {
			throw new Error("Should not have been called");
		})).eq(false);
	});
	it("fast-succeeds identity", () => {
		const list = [ 1, 2, 3 ];
		expect(arrayEq(list, list, () => {
			throw new Error("Should not have been called");
		})).eq(true);
	});
	it("defaults to identity predicate", () => {
		expect(arrayEq([ { a: "a" } ], [ { a: "a" } ])).eq(false);
		expect(arrayEq([ 1, 2, 3 ], [ 1, 2, 3 ])).eq(true);
	});
	it("allows custom predicate", () => {
		let called = 0;
		expect(arrayEq([ 1, "a" ], [ 1, "b" ], (a, b, n) => {
			called++;
			if (n === 0) {
				expect(a, "a").eq(1);
				expect(b, "b").eq(1);
				return true;
			}
			if (n === 1) {
				expect(a, "a").eq("a");
				expect(b, "b").eq("b");
				return false;
			}
			throw new Error(`Unexpected index: ${n}`);
		})).eq(false);
		expect(called, "called").eq(2);
	});
});
