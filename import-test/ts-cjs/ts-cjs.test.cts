import { concatRegExp as concatRegExpBarrel } from "@rickosborne/foundation";
import { concatRegExp as concatRegExpDirect } from "@rickosborne/foundation/concat-reg-exp";
import * as assert from "node:assert";
import * as strictAssert from "node:assert/strict";
import { describe, it } from "node:test";
import { regExpComparator } from "./ts-cjs-fn.cjs";

describe(concatRegExpBarrel.name, () => {
	const compareRegExp = (actual: RegExp, expected: RegExp): void => {
		strictAssert.strictEqual(actual.source, expected.source, "source");
		strictAssert.strictEqual(actual.flags, expected.flags, "flags");
	};
	it("works", () => {
		compareRegExp(concatRegExpBarrel(/^foo$/, /^bar$/), /^foobar$/);
	});
});

describe(regExpComparator.name, () => {
	it("does what it says", () => {
		strictAssert.strictEqual(regExpComparator(concatRegExpBarrel(/^foo$/, /^bar$/), /^foobar$/), 0);
	});
});

describe("imports", () => {
	it("finds the same function", () => {
		assert.strictEqual(concatRegExpBarrel, concatRegExpDirect);
	})
});
