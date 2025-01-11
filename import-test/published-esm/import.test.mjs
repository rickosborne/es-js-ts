import {isPlainObject as isPlainObjectBarrel} from "@rickosborne/guard";
import {isPlainObject as isPlainObjectDirect} from "@rickosborne/guard/is-object";
import * as assert from "node:assert";
import {describe, it} from "node:test";

describe("imports", () => {
	it("can run the function", () => {
		assert.strictEqual(isPlainObjectBarrel({}), true);
	});
	it("finds the same functions both ways", () => {
		assert.strictEqual(isPlainObjectDirect, isPlainObjectBarrel);
	});
});
