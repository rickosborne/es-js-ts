import { expect } from "chai";
import { describe, it } from "mocha";
import { cssFormatHSV, type HSV, hsvComparator, toHSV } from "../hsv.js";
import { testComparator } from "./wiki-colors.fixture.js";

describe(hsvComparator.name, () => {
	it("sorts", () => {
		testComparator<HSV>(
			(w) => w.hsv,
			hsvComparator,
			"h", "s", "v", "a",
		);
	});
});

describe(cssFormatHSV.name, () => {
	it("handles alpha", () => {
		expect(cssFormatHSV(toHSV(0, 0, 0))).eq("hwb(0 0 0)");
		expect(cssFormatHSV(toHSV(0, 0, 0, 0))).eq("hwb(0 0 0 / 0)");
		expect(cssFormatHSV(toHSV(0, 0, 0, 0.5))).eq("hwb(0 0 0 / 50%)");
		expect(cssFormatHSV(toHSV(0, 0, 0, 1))).eq("hwb(0 0 0)");
		expect(cssFormatHSV(toHSV(60, 1, 1))).eq("hwb(60 100% 100%)");
		expect(cssFormatHSV(toHSV(60, 1, 1, 0))).eq("hwb(60 100% 100% / 0)");
		expect(cssFormatHSV(toHSV(60, 1, 1, 0.5))).eq("hwb(60 100% 100% / 50%)");
		expect(cssFormatHSV(toHSV(60, 1, 1, 1))).eq("hwb(60 100% 100%)");
	});
});
