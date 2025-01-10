import {isPlainObject as isPlainObjectBarrel} from "@rickosborne/guard";
import * as assert from "node:assert";
import {describe, it} from "node:test";

describe("imports", () => {
	it("can run the function", () => {
		assert.strictEqual(isPlainObjectBarrel({}), true);
	});
});
