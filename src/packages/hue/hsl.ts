import { cssFormatAlpha01, cssFormatDimension, cssFormatPercent } from "@rickosborne/css";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";
import { type Float01, type Int360, toFloat01, toInt360 } from "./numbers.js";

export interface HSL {
	a?: Float01 | undefined;
	h: Int360;
	l: Float01;
	s: Float01;
}

export interface HSLA extends HSL {
	a: Float01;
}

export function toHSL(h360: number, s01: number, l01: number, a01: number): HSLA;
export function toHSL(h360: number, s01: number, l01: number, a01?: number | undefined): HSL;
/**
 * Build a structured HSL out of numbers, ensuring their range.
 */
export function toHSL(h: number, s: number, l: number, a?: number | undefined): HSL {
	const hsl: HSL = {
		h: toInt360(h, "hue"),
		s: toFloat01(s, "saturation"),
		l: toFloat01(l, "luminance"),
	};
	if (a != null) {
		hsl.a = toFloat01(a);
	}
	return hsl;
}

export const hslComparator = colorComparatorBuilder<HSL>("hslComparator", "h", "s", "l", "a");

export const hslEq = colorEqBuilder<HSL>("hslEq", [ "h", "s", "l", "a" ]);

export function chroma01FromHSL(hsl: HSL | { s: Float01; l: Float01 }): Float01;
export function chroma01FromHSL(hsl: HSL | { s: Float01; l: Float01 } | undefined): Float01 | undefined;
export function chroma01FromHSL(hsl: HSL | { s: Float01; l: Float01 } | undefined): Float01 | undefined {
	if (hsl == null) {
		return undefined;
	}
	const { l, s } = hsl;
	return toFloat01((1 - Math.abs((2 * l) - 1)) * s);
}

export const cssFormatHSL = (hsl: HSL): string => {
	const { a, h, l, s } = hsl;
	return `hsl(${ cssFormatDimension(h) } ${ cssFormatPercent(s) } ${ cssFormatPercent(l) }${ cssFormatAlpha01(a) })`;
};
