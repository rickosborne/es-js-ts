import { expect } from "chai";
import { describe, it } from "mocha";
import { cssFormatHSL, type HSL, hslComparator, toHSL } from "../hsl.js";
import { testComparator } from "./wiki-colors.fixture.js";

describe(hslComparator.name, () => {
	it("sorts", () => {
		testComparator<HSL>(
			(w) => w.hsl,
			hslComparator,
			"h", "s", "l", "a",
		);
	});
});

describe(cssFormatHSL.name, () => {
	it("handles alpha", () => {
		expect(cssFormatHSL(toHSL(0, 0, 0))).eq("hsl(0 0 0)");
		expect(cssFormatHSL(toHSL(0, 0, 0, 0))).eq("hsl(0 0 0 / 0)");
		expect(cssFormatHSL(toHSL(0, 0, 0, 0.5))).eq("hsl(0 0 0 / 50%)");
		expect(cssFormatHSL(toHSL(0, 0, 0, 1))).eq("hsl(0 0 0)");
		expect(cssFormatHSL(toHSL(60, 1, 1))).eq("hsl(60 100% 100%)");
		expect(cssFormatHSL(toHSL(60, 1, 1, 0))).eq("hsl(60 100% 100% / 0)");
		expect(cssFormatHSL(toHSL(60, 1, 1, 0.5))).eq("hsl(60 100% 100% / 50%)");
		expect(cssFormatHSL(toHSL(60, 1, 1, 1))).eq("hsl(60 100% 100%)");
	});
});
