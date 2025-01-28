import { CSSError } from "@rickosborne/css";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ColorConversionError } from "../color-conversion-error.js";
import { colorFromCSS } from "../color-from-css.js";
import type { UncheckedColorParts } from "../color.js";
import { testColor } from "./test-color.fixture.js";
import type { CombinedParts } from "./test-color.fixture.js";

const purpleParts: UncheckedColorParts = {};

const purpleCombined: CombinedParts = {
	cssHex: "#639",
	cssHSL: "hsl(270 50% 40%)",
	cssHWB: "hwb(270 66.7% 60%)",
	cssRGB: "rgb(102 51 153)",
	hex: "#663399",
};

describe(colorFromCSS.name, () => {
	it("handles color names", () => {
		testColor(colorFromCSS("rebeccapurple"), purpleParts, purpleCombined);
		expect(() => colorFromCSS("bogus")).throws(CSSError, "Unknown keyword: bogus");
	});
	it("handles hex values", () => {
		testColor(colorFromCSS("#639"), purpleParts, purpleCombined);
		testColor(colorFromCSS("#663399"), purpleParts, purpleCombined);
		testColor(colorFromCSS("#663399aa"), {}, {
			cssHex: "#639A",
			hex: "#663399AA",
		});
		expect(() => colorFromCSS("#7")).throws(ColorConversionError, "Expected a hex value");
		expect(() => colorFromCSS("#123456789")).throws(ColorConversionError, "Expected a hex value");
	});
	it("handles rgb()", () => {
		testColor(colorFromCSS("rgb(102 51 153)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("color(sRGB 0.4 0.2 0.6)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("color(sRGB 40% 20% 60%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("rgb(102, 51, 153)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("rgb(102, 51, 153 / 100%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("rgba(102, 51, 153 / 1)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("rgb(102, 51, 153, 40%)"), purpleParts, {
			cssHex: "#6396",
			cssRGB: "rgb(102 51 153 / 40%)",
			hex: "#66339966",
		});
		testColor(colorFromCSS("rgb(none none none)"), {
			red255: 0,
			green255: 0,
			blue255: 0,
			sl01: 0,
			lum01: 0,
			val01: 0,
			sv01: 0,
			alpha255: 255,
			alpha01: 1,
		}, {
			cssHex: "#000",
			hex: "#000000",
		});
	});
	it("handles hsl()", () => {
		testColor(colorFromCSS("hsl(270 50% 40%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hsl(270deg, 50%, 40%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hsla(270 deg 50% 40% / 100%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hsl(270 50% 40% / 1)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hsl(270 50% 40% 40%)"), purpleParts, {
			cssHex: "#6396",
			cssHSL: "hsl(270 50% 40% / 40%)",
			cssRGB: "rgb(102 51 153 / 40%)",
			hex: "#66339966",
		});
	});
	it("handles hwb()", () => {
		testColor(colorFromCSS("hwb(0.75turn 66.7% 60%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hwb(4.712rad, 66.7%, 60%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hwb(300grad 66.7% 60% / 100%)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hwb(270 66.7% 60% / 1)"), purpleParts, purpleCombined);
		testColor(colorFromCSS("hwb(270 66.7% 60% 40%)"), purpleParts, {
			cssHex: "#6396",
			cssHSL: "hsl(270 50% 40% / 40%)",
			cssHWB: "hwb(270 66.7% 60% / 40%)",
			cssRGB: "rgb(102 51 153 / 40%)",
			hex: "#66339966",
		});
	});
	it("throws for bogus patterns", () => {
		expect(() => colorFromCSS("rgb(0 / 0 / 0)")).throws(CSSError, "Malformed rgb() color");
		expect(() => colorFromCSS("hwb(0 0)")).throws(CSSError, "Malformed hwb() color");
		expect(() => colorFromCSS("rgb(0 0deg 0)")).throws(ColorConversionError, "Unknown color value unit: deg");
		expect(() => colorFromCSS("hsla(0 0)")).throws(CSSError, "Malformed hsla() color");
		expect(() => colorFromCSS("rgba(1 2 3 4 5)")).throws(CSSError, "Malformed rgba() color");
		expect(() => colorFromCSS("arg(1 2 3)")).throws(CSSError, "Unknown keyword: arg");
	});
});
