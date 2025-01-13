import { expect } from "chai";
import { describe, it } from "mocha";
import type { UnbrandedNumbers } from "../color-comparator.js";
import { hslFromHSV, hsvFromHSL, rgbFromHSL, rgbFromHSV } from "../color-conversion.js";
import { type HSL, hslEq } from "../hsl.js";
import { type HSV, hsvEq } from "../hsv.js";
import type { Int255 } from "../numbers.js";
import { type RGB, rgbEq } from "../rgb.js";
import { WIKI_COLORS } from "./wiki-colors.fixture.js";

const compareColors = <C extends object>(
	epsilon: number,
	...keys: (string & keyof UnbrandedNumbers<C>)[]
): ((a: C, b: C, hex: string) => void) => {
	return (a: C, b: C, hex: string): void => {
		for (const key of keys) {
			const aValue = a[ key ] as number | undefined;
			const bValue = b[ key ] as number | undefined;
			expect(aValue == null, hex.concat(".", key)).eq(bValue == null);
			if (aValue != null && bValue != null) {
				expect(aValue, hex.concat(".", key)).closeTo(bValue, epsilon);
			}
		}
	};
};

const compareHSL = compareColors<HSL>(0.01, "h", "s", "l", "a");
const compareHSV = compareColors<HSV>(0.01, "h", "s", "v", "a");
const compareRGB = compareColors<RGB>(2, "r", "g", "b", "a");

describe("color-conversion", () => {
	describe(hslFromHSV.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, hsv } of WIKI_COLORS) {
				const converted = hslFromHSV(hsv);
				compareHSL(hsl, converted, hex);
				expect(hslEq(hsl, converted, 0.01)).eq(true);
			}
			expect(hslFromHSV(undefined)).eq(undefined);
		});
	});

	describe(hsvFromHSL.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, hsv } of WIKI_COLORS) {
				const converted = hsvFromHSL(hsl);
				compareHSV(hsv, converted, hex);
				expect(hsvEq(hsv, converted, 0.01)).eq(true);
			}
			expect(hsvFromHSL(undefined)).eq(undefined);
		});
	});

	describe(rgbFromHSL.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, rgb } of WIKI_COLORS) {
				const converted = rgbFromHSL(hsl);
				compareRGB(rgb, converted, hex);
				expect(rgbEq(rgb, converted, 2)).eq(true);
			}
			const rgb = WIKI_COLORS[ 0 ]!.rgb;
			expect(rgbEq(rgb, undefined, 2)).eq(false);
			expect(rgbEq(undefined, rgb, 2)).eq(false);
			expect(rgbEq(undefined, undefined, 2)).eq(true);
			expect(rgbEq(rgb, rgb, 2)).eq(true);
			expect(rgbEq(rgb, { ...rgb }, 2)).eq(true);
			const { r: _r, ...broken } = rgb;
			expect(rgbEq(rgb, broken as RGB, 2)).eq(false);
			const close = { ...rgb };
			close.r = close.r + 3 as Int255;
			expect(rgbEq(rgb, close, 2)).eq(false);
			expect(rgbFromHSL(undefined)).eq(undefined);
		});
	});

	describe(rgbFromHSV.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsv, rgb } of WIKI_COLORS) {
				const converted = rgbFromHSV(hsv);
				compareRGB(rgb, converted, hex);
				expect(rgbEq(rgb, converted, 2), hex).eq(true);
			}
			expect(rgbFromHSV(undefined)).eq(undefined);
		});
	});
});
