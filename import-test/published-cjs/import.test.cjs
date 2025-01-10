const assert = require("node:assert");
const {describe, it} = require("node:test");
const {isPlainObject: isPlainObjectBarrel} = require("@rickosborne/guard");

describe("imports", () => {
	it("can run the function", () => {
		assert.strictEqual(isPlainObjectBarrel({}), true);
	});
});
