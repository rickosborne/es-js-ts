import { expect } from "chai";
import { describe, it } from "mocha";
import { SOME_VALUE } from "../ts/empty.js";

describe("module-template", () => {
	it("test setup works", () => {
		expect(SOME_VALUE).eq(SOME_VALUE);
	});
});
