import { describe, it } from "mocha";
import { expect } from "chai";
import { roundTo } from "../round-to.js";

describe(roundTo.name, () => {
	it("allows a resolution of 0", () => {
		expect(roundTo(6.5, 0)).eq(7);
		expect(roundTo(-6.5, 0)).eq(-6);
		expect(roundTo(6.5, 1)).eq(7);
		expect(roundTo(-6.5, 1)).eq(-6);
		expect(roundTo(6.5)).eq(7);
	});
	it("handles reasonable resolutions", () => {
		expect(roundTo(6.543, 0.1)).eq(6.5);
		expect(roundTo(4.567, 0.1)).closeTo(4.6, 0.0001);
		expect(roundTo(6.3, 0.25)).eq(6.25);
		expect(roundTo(6.4, 0.25)).eq(6.5);
		expect(roundTo(4.567, 0.01)).eq(4.57);
		expect(roundTo(5.432, 0.01)).eq(5.43);
	});
});
