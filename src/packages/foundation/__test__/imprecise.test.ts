import { expect } from "chai";
import { describe, it } from "mocha";
import { imprecise } from "../imprecise.js";

describe(imprecise.name, () => {
	it("handles float errors", () => {
		expect(imprecise(51.2300000001)).eq("51.23");
		expect(imprecise(51.2300000001, 0.01)).eq("51.23");
		expect(imprecise(51.2300000001, 0.1)).eq("51.2");
		expect(imprecise(51.2399999, 0.1)).eq("51.2");
		expect(imprecise(51.2300000001, 1)).eq("51");
		expect(imprecise(51.2300000001, 2)).eq("52");
		expect(imprecise(51.2300000001, 10)).eq("50");
		expect(imprecise(51.2399999, 10)).eq("50");
	});
});
