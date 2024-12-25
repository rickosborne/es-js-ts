import { describe, it } from "mocha";
import { expect } from "chai";
import { hasArray } from "../has-array.js";
import { isInt } from "../is-int.js";

describe(hasArray.name, () => {
	const season = {
		crops: Array<string>(1),
		farmed: new Set<number>(),
		locations: new Map<string, string>(),
		months: [ "April", "May", "June" ],
	};
	it("is true for arrays", () => {
		expect(hasArray(season, "crops")).eq(true);
		expect(hasArray(season, "months")).eq(true);
	});
	it("is false for non-arrays", () => {
		expect(hasArray(season, "farmed")).eq(false);
		expect(hasArray(season, "locations")).eq(false);
		expect(hasArray(season, "bogus")).eq(false);
		expect(hasArray(null, "bogus")).eq(false);
		expect(hasArray(undefined, "bogus")).eq(false);
	});
	it("is false for the wrong item type", () => {
		expect(hasArray(season, "months", isInt)).eq(false);
	});
});
