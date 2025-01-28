import { cssFormatAlpha01, cssFormatDimension, cssFormatPercent } from "@rickosborne/css";
import { toInt360, toReal01 } from "@rickosborne/rebound";
import type { Int360, Real01 } from "@rickosborne/rebound";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";

export interface HSL {
	a?: Real01 | undefined;
	h: Int360;
	l: Real01;
	s: Real01;
}

export interface HSLA extends HSL {
	a: Real01;
}

export function toHSL(h360: number, s01: number, l01: number, a01: number): HSLA;
export function toHSL(h360: number, s01: number, l01: number, a01?: number | undefined): HSL;
/**
 * Build a structured HSL out of numbers, ensuring their range.
 */
export function toHSL(h: number, s: number, l: number, a?: number | undefined): HSL {
	const hsl: HSL = {
		h: toInt360(h, "hue"),
		s: toReal01(s, "saturation"),
		l: toReal01(l, "luminance"),
	};
	if (a != null) {
		hsl.a = toReal01(a);
	}
	return hsl;
}

export const hslComparator = colorComparatorBuilder<HSL>("hslComparator", "h", "s", "l", "a");

export const hslEq = colorEqBuilder<HSL>("hslEq", [ "h", "s", "l", "a" ], { h: 1, s: 0.01, l: 0.01, a: 0.01 });

export function chroma01FromHSL(hsl: HSL | { s: Real01; l: Real01 }): Real01;
export function chroma01FromHSL(hsl: HSL | { s: Real01; l: Real01 } | undefined): Real01 | undefined;
export function chroma01FromHSL(hsl: HSL | { s: Real01; l: Real01 } | undefined): Real01 | undefined {
	if (hsl == null) {
		return undefined;
	}
	const { l, s } = hsl;
	return toReal01((1 - Math.abs((2 * l) - 1)) * s);
}

export const cssFormatHSL = (hsl: HSL): string => {
	const { a, h, l, s } = hsl;
	return `hsl(${ cssFormatDimension(h) } ${ cssFormatPercent(s) } ${ cssFormatPercent(l) }${ cssFormatAlpha01(a) })`;
};
