import { assertDefined } from "@rickosborne/guard";
import * as assert from "node:assert";
import { describe, it } from "node:test";

import { concatRegExp } from "@rickosborne/foundation";
import { regExpComparator } from "./ts-node16-fn.mjs";

describe(concatRegExp.name, () => {
	const compareRegExp = (actual: RegExp, expected: RegExp): void => {
		assertDefined(actual.source, "actual.source");
		assert.strictEqual(actual.source, expected.source, "source");
		assert.strictEqual(actual.flags, expected.flags, "flags");
	};
	it("works", () => {
		compareRegExp(concatRegExp(/^foo$/, /^bar$/), /^foobar$/);
	}).catch(console.error);
}).catch(console.error);

describe(regExpComparator.name, () => {
	it("does what it says", () => {
		assert.strictEqual(regExpComparator(concatRegExp(/^foo$/, /^bar$/), /^foobar$/), 0);
	}).catch(console.error);
}).catch(console.error);
