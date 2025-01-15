import { expect } from "chai";
import { describe, it } from "mocha";
import { cssFormatAlpha01, cssFormatDimension, cssFormatHex, cssFormatPercent } from "../format.js";

describe("format", () => {
	describe(cssFormatHex.name, () => {
		it("adds # and uppercases", () => {
			expect(cssFormatHex("abc123")).eq("#ABC123");
			expect(cssFormatHex("#DEF456")).eq("#DEF456");
			expect(cssFormatHex("abc12345")).eq("#ABC12345");
		});
		it("shortens", () => {
			expect(cssFormatHex("#336699")).eq("#369");
			expect(cssFormatHex("336699")).eq("#369");
			expect(cssFormatHex("#336699AA")).eq("#369A");
			expect(cssFormatHex("336699AA")).eq("#369A");
			expect(cssFormatHex("#336699", "short")).eq("#369");
			expect(cssFormatHex("336699", "short")).eq("#369");
			expect(cssFormatHex("#336699AA", "short")).eq("#369A");
			expect(cssFormatHex("336699AA", "short")).eq("#369A");
			expect(cssFormatHex("#346699AA", "short")).eq("#346699AA");
			expect(cssFormatHex("346699AA", "short")).eq("#346699AA");
		});
		it("lengthens", () => {
			expect(cssFormatHex("#369", "long")).eq("#336699");
			expect(cssFormatHex("369", "long")).eq("#336699");
			expect(cssFormatHex("369A", "long")).eq("#336699AA");
			expect(cssFormatHex("#369a", "long")).eq("#336699AA");
			expect(cssFormatHex("#123456", "long")).eq("#123456");
			expect(cssFormatHex("#12345678", "long")).eq("#12345678");
		});
	});

	describe(cssFormatDimension.name, () => {
		it("rounds to zero", () => {
			expect(cssFormatDimension(0, "deg")).eq("0");
			expect(cssFormatDimension(0.004, "deg")).eq("0");
			expect(cssFormatDimension(0.004, "deg", 0.001)).eq("0.004deg");
			expect(cssFormatDimension(123.48, "deg")).eq("123.5deg");
			expect(cssFormatDimension(123.48, "px")).eq("123px");
			expect(cssFormatDimension(23.4812, "vw")).eq("23.481vw");
			expect(cssFormatDimension(23.4812, "%")).eq("23.5%");
		});
	});

	describe(cssFormatPercent.name, () => {
		it("is empty for null-ish", () => {
			expect(cssFormatPercent(undefined)).eq("");
		});
		it("has no units for zero", () => {
			expect(cssFormatPercent(0)).eq("0");
			expect(cssFormatPercent(0.0001)).eq("0");
		});
		it("handles non-premultiplied values", () => {
			expect(cssFormatPercent(1.000001)).eq("1%");
			expect(cssFormatPercent(2)).eq("2%");
		});
		it("handles Real01 values", () => {
			expect(cssFormatPercent(1)).eq("100%");
			expect(cssFormatPercent(0.5678)).eq("56.8%");
		});
	});

	describe(cssFormatAlpha01.name, () => {
		it("returns empty string when not needed", () => {
			expect(cssFormatAlpha01(1), "1").eq("");
			expect(cssFormatAlpha01(undefined), "undefined").eq("");
		});
		it("uses slash form", () => {
			expect(cssFormatAlpha01(0.25), "0.25").eq(" / 25%");
			expect(cssFormatAlpha01(0.257, 1), "0.257 res 1").eq(" / 26%");
		});
	});
});
