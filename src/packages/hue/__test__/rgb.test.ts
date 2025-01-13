import { NO_THROW } from "@rickosborne/guard";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ColorConversionError } from "../color-conversion-error.js";
import { chroma01FromRGB, cssFormatRGB, hue360FromRGB, parseHexRGB, type RGB, rgbComparator, toRGB } from "../rgb.js";
import { testComparator } from "./wiki-colors.fixture.js";

describe(parseHexRGB.name, () => {
	it("handles long forms", () => {
		expect(parseHexRGB("#12345678")).eql({ r: 18, g: 52, b: 86, a: 120 });
		expect(parseHexRGB("#123456")).eql({ r: 18, g: 52, b: 86 });
		expect(parseHexRGB("12345678")).eql({ r: 18, g: 52, b: 86, a: 120 });
		expect(parseHexRGB("123456")).eql({ r: 18, g: 52, b: 86 });
	});
	it("throws for garbage, unless told otherwise", () => {
		expect(() => parseHexRGB("")).throws(ColorConversionError);
		expect(() => parseHexRGB("#")).throws(ColorConversionError);
		expect(() => parseHexRGB("00000")).throws(ColorConversionError);
		expect(() => parseHexRGB("#00")).throws(ColorConversionError);
		expect(() => parseHexRGB("garbage")).throws(ColorConversionError);
		expect(parseHexRGB("garbage", NO_THROW)).eq(undefined);
	});
	it("handles short forms", () => {
		expect(parseHexRGB("#123")).eql({ r: 17, g: 34, b: 51 });
		expect(parseHexRGB("#1234")).eql({ r: 17, g: 34, b: 51, a: 68 });
		expect(parseHexRGB("123")).eql({ r: 17, g: 34, b: 51 });
		expect(parseHexRGB("1234")).eql({ r: 17, g: 34, b: 51, a: 68 });
	});
	it("handles upper and lower", () => {
		expect(parseHexRGB("#abc")).eql({ r: 170, g: 187, b: 204 });
		expect(parseHexRGB("#ABC")).eql({ r: 170, g: 187, b: 204 });
		expect(parseHexRGB("dEf")).eql({ r: 221, g: 238, b: 255 });
		expect(parseHexRGB("DeF0")).eql({ r: 221, g: 238, b: 255, a: 0 });
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
		expect(hue360FromRGB(parseHexRGB("#ff0004"))).eq(359);
		expect(hue360FromRGB(parseHexRGB("#ff0400"))).eq(1);
	});
});

describe(rgbComparator.name, () => {
	it("sorts", () => {
		testComparator<RGB>(
			(w) => w.rgb,
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
