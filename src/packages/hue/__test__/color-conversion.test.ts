import type { Int255 } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { UnbrandedNumbers } from "../color-comparator.js";
import { hslFromHSV, hslFromRGB, hsvFromHSL, rgbFromHSL, rgbFromHSV } from "../color-conversion.js";
import { type HSL, hslEq } from "../hsl.js";
import { type HSV, hsvEq } from "../hsv.js";
import { COLOR_EPSILON } from "../numbers.js";
import { type RGB, type RGB255, rgb255From01, rgbEq } from "../rgb.js";
import { WIKI_COLORS } from "./wiki-colors.fixture.js";

const compareColors = <C extends object>(
	epsilons: Partial<Record<keyof C, number>>,
	...keys: (string & keyof UnbrandedNumbers<C>)[]
): ((a: C, b: C, hex: string) => void) => {
	return (a: C, b: C, hex: string): void => {
		for (const key of keys) {
			const aValue = a[ key ] as number | undefined;
			const bValue = b[ key ] as number | undefined;
			expect(aValue == null, hex.concat(".", key)).eq(bValue == null);
			if (aValue != null && bValue != null) {
				const eps = epsilons[ key ] ?? COLOR_EPSILON;
				expect(aValue, hex.concat(".", key)).closeTo(bValue, eps);
			}
		}
	};
};

const compareHSL = compareColors<HSL>({ h: 1, s: 0.01, l: 0.01 }, "h", "s", "l", "a");
const compareHSV = compareColors<HSV>({ h: 1, s: 0.01, v: 0.01 }, "h", "s", "v", "a");
const compareRGB = compareColors<RGB255>({ r: 2, g: 2, b: 2 }, "r", "g", "b", "a");

describe("color-conversion", () => {
	describe(hslFromHSV.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, hsv } of WIKI_COLORS) {
				const converted = hslFromHSV(hsv);
				compareHSL(hsl, converted, hex);
				expect(hslEq(hsl, converted), [ hex, hsl, converted ].map((n) => JSON.stringify(n)).join(" ")).eq(true);
			}
			expect(hslFromHSV(undefined)).eq(undefined);
		});
	});

	describe(hsvFromHSL.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, hsv } of WIKI_COLORS) {
				const converted = hsvFromHSL(hsl);
				compareHSV(hsv, converted, hex);
				expect(hsvEq(hsv, converted)).eq(true);
			}
			expect(hsvFromHSL(undefined)).eq(undefined);
		});
	});

	describe(rgbFromHSL.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, rgb } of WIKI_COLORS) {
				const converted = rgb255From01(rgbFromHSL(hsl));
				compareRGB(rgb, converted, hex);
				expect(rgbEq(rgb, converted)).eq(true);
			}
			const rgb = WIKI_COLORS[ 0 ]!.rgb;
			expect(rgbEq(rgb, undefined)).eq(false);
			expect(rgbEq(undefined, rgb)).eq(false);
			expect(rgbEq(undefined, undefined)).eq(true);
			expect(rgbEq(rgb, rgb)).eq(true);
			expect(rgbEq(rgb, { ...rgb })).eq(true);
			const { r: _r, ...broken } = rgb;
			expect(rgbEq(rgb, broken as RGB)).eq(false);
			const close = { ...rgb };
			close.r = close.r + 3 as Int255;
			expect(rgbEq(rgb, close)).eq(false);
			expect(rgbFromHSL(undefined)).eq(undefined);
		});
	});

	describe(rgbFromHSV.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsv, rgb } of WIKI_COLORS) {
				const converted = rgb255From01(rgbFromHSV(hsv));
				compareRGB(rgb, converted, hex);
				expect(rgbEq(rgb, converted), hex).eq(true);
			}
			expect(rgbFromHSV(undefined)).eq(undefined);
		});
	});

	describe(hslFromRGB.name, () => {
		it("matches wikipedia", () => {
			for (const { hex, hsl, rgb } of WIKI_COLORS) {
				const converted = hslFromRGB(rgb);
				compareHSL(hsl, converted, hex);
				expect(hslEq(hsl, converted), hex).eq(true);
			}
			expect(hslFromRGB(undefined)).eq(undefined);
		});
	});
});
