import { expect } from "chai";
import { describe, it } from "mocha";
import { entriesOf } from "../entries-of.js";

describe("entriesOf", () => {
	it("really is just Object.entries", () => {
		expect(entriesOf).eq(Object.entries);
	});
});
