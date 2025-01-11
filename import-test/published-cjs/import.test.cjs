const assert = require("node:assert");
const {describe, it} = require("node:test");
const {isPlainObject: isPlainObjectBarrel} = require("@rickosborne/guard");
const {isPlainObject: isPlainObjectDirect} = require("@rickosborne/guard/is-object");

describe("imports", () => {
	it("can run the function", () => {
		assert.strictEqual(isPlainObjectBarrel({}), true);
	});
	it("finds the same functions both ways", () => {
		assert.strictEqual(isPlainObjectDirect, isPlainObjectBarrel);
	});
});
