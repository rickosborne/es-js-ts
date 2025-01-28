import { NO_THROW } from "@rickosborne/guard";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ColorConversionError } from "../color-conversion-error.js";
import type { IntRGB } from "../rgb.js";
import { chroma01FromRGB, cssFormatRGB, rgbComparator, rgbFromHex, rgbIntFrom01, toRGB } from "../rgb.js";
import { hue360FromRGB } from "../color-conversion.js";
import { testComparator } from "./wiki-colors.fixture.js";

describe(rgbFromHex.name, () => {
	it("handles long forms", () => {
		expect(rgbFromHex("#12345678")).eql({ r: 18, g: 52, b: 86, a: 120 });
		expect(rgbFromHex("#123456")).eql({ r: 18, g: 52, b: 86 });
		expect(rgbFromHex("12345678")).eql({ r: 18, g: 52, b: 86, a: 120 });
		expect(rgbFromHex("123456")).eql({ r: 18, g: 52, b: 86 });
	});
	it("throws for garbage, unless told otherwise", () => {
		expect(() => rgbFromHex("")).throws(ColorConversionError);
		expect(() => rgbFromHex("#")).throws(ColorConversionError);
		expect(() => rgbFromHex("00000")).throws(ColorConversionError);
		expect(() => rgbFromHex("#00")).throws(ColorConversionError);
		expect(() => rgbFromHex("garbage")).throws(ColorConversionError);
		expect(rgbFromHex("garbage", NO_THROW)).eq(undefined);
	});
	it("handles short forms", () => {
		expect(rgbFromHex("#123")).eql({ r: 17, g: 34, b: 51 });
		expect(rgbFromHex("#1234")).eql({ r: 17, g: 34, b: 51, a: 68 });
		expect(rgbFromHex("123")).eql({ r: 17, g: 34, b: 51 });
		expect(rgbFromHex("1234")).eql({ r: 17, g: 34, b: 51, a: 68 });
	});
	it("handles upper and lower", () => {
		expect(rgbFromHex("#abc")).eql({ r: 170, g: 187, b: 204 });
		expect(rgbFromHex("#ABC")).eql({ r: 170, g: 187, b: 204 });
		expect(rgbFromHex("dEf")).eql({ r: 221, g: 238, b: 255 });
		expect(rgbFromHex("DeF0")).eql({ r: 221, g: 238, b: 255, a: 0 });
	});
});

describe(chroma01FromRGB.name, () => {
	it("does what it says", () => {
		expect(chroma01FromRGB(toRGB(0, 0, 0))).eq(0);
		expect(chroma01FromRGB(toRGB(128, 128, 128))).eq(0);
		expect(chroma01FromRGB(toRGB(255, 255, 255))).eq(0);
		expect(chroma01FromRGB(toRGB(0, 255, 255))).eq(1);
		expect(chroma01FromRGB(toRGB(255, 0, 255))).eq(1);
		expect(chroma01FromRGB(toRGB(255, 0, 0))).eq(1);
		expect(chroma01FromRGB(toRGB(255, 51, 99))).eq(0.8);
		expect(chroma01FromRGB(toRGB(204, 102, 103))).eq(0.4);
	});
});

describe(hue360FromRGB.name, () => {
	it("does what it says", () => {
		expect(hue360FromRGB(toRGB(0, 0, 0))).eq(0);
		expect(hue360FromRGB(toRGB(255, 0, 0))).eq(0);
		expect(hue360FromRGB(toRGB(0, 255, 0))).eq(120);
		expect(hue360FromRGB(toRGB(0, 0, 255))).eq(240);
		expect(hue360FromRGB(toRGB(1, 0, 0))).eq(0);
		expect(hue360FromRGB(toRGB(0, 1, 0))).eq(120);
		expect(hue360FromRGB(toRGB(0, 0, 1))).eq(240);
		expect(hue360FromRGB(toRGB(1, 1, 0))).eq(60);
		expect(hue360FromRGB(toRGB(0, 1, 1))).eq(180);
		expect(hue360FromRGB(toRGB(1, 0, 1))).eq(300);
		expect(hue360FromRGB(rgbFromHex("#ff0004"))).eq(359);
		expect(hue360FromRGB(rgbFromHex("#ff0400"))).eq(1);
		expect(hue360FromRGB(undefined)).eq(undefined);
	});
});

describe(rgbComparator.name, () => {
	it("sorts", () => {
		testComparator<IntRGB>(
			(w) => rgbIntFrom01(w.rgb01),
			rgbComparator,
			"r", "g", "b", "a",
		);
	});
});

describe(cssFormatRGB.name, () => {
	it("handles alpha", () => {
		expect(cssFormatRGB(toRGB(32, 64, 96))).eq("rgb(32 64 96)");
		expect(cssFormatRGB(toRGB(32, 64, 96, 255))).eq("rgb(32 64 96)");
		expect(cssFormatRGB(toRGB(32, 64, 96, 0))).eq("rgb(32 64 96 / 0)");
		expect(cssFormatRGB(toRGB(32, 64, 96, 128))).eq("rgb(32 64 96 / 50.2%)");
	});
});
