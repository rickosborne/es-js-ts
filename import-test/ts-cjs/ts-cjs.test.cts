import * as strictAssert from "node:assert/strict";
import { describe, it } from "node:test";

import {concatRegExp} from "@rickosborne/foundation";
import { regExpComparator } from "./ts-cjs-fn.cjs";

describe(concatRegExp.name, () => {
	const compareRegExp = (actual: RegExp, expected: RegExp): void => {
		strictAssert.strictEqual(actual.source, expected.source, "source");
		strictAssert.strictEqual(actual.flags, expected.flags, "flags");
	};
	it("works", () => {
		compareRegExp(concatRegExp(/^foo$/, /^bar$/), /^foobar$/);
	});
});

describe(regExpComparator.name, () => {
	it("does what it says", () => {
		strictAssert.strictEqual(regExpComparator(concatRegExp(/^foo$/, /^bar$/), /^foobar$/), 0);
	});
});
