import { cssFormatAlpha01, cssFormatDimension, cssFormatPercent } from "@rickosborne/css";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";
import { type Float01, type Int360, toFloat01, toInt360 } from "./numbers.js";

export interface HSV {
	a?: Float01 | undefined;
	h: Int360;
	s: Float01;
	v: Float01;
}

export interface HSVA extends HSV {
	a: Float01;
}

export function toHSV(h360: number, s01: number, v01: number, a01: number): HSVA;
export function toHSV(h360: number, s01: number, v01: number, a01?: number | undefined): HSV;
/**
 * Build a structured HSV out of numbers, ensuring their range.
 */
export function toHSV(h: number, s: number, v: number, a?: number | undefined): HSV {
	const hsv: HSV = {
		h: toInt360(h, "hue"),
		s: toFloat01(s, "saturation"),
		v: toFloat01(v, "value/brightness"),
	};
	if (a != null) {
		hsv.a = toFloat01(a);
	}
	return hsv;
}

export const hsvComparator = colorComparatorBuilder<HSV>("hsvComparator", "h", "s", "v", "a");

export const hsvEq = colorEqBuilder<HSV>("hsvEq", [ "h", "s", "v", "a" ], { h: 1, s: 0.01, v: 0.01, a: 0.01 });

export function chroma01FromHSV(hsv: HSV | { s: Float01; v: Float01 }): Float01;
export function chroma01FromHSV(hsv: HSV | { s: Float01; v: Float01 } | undefined): Float01 | undefined;
export function chroma01FromHSV(hsv: HSV | { s: Float01; v: Float01 } | undefined): Float01 | undefined {
	if (hsv == null) {
		return undefined;
	}
	const { v, s } = hsv;
	return s * v as Float01;
}

export const cssFormatHSV = (hsv: HSV): string => {
	const { h, s, v, a } = hsv;
	return `hwb(${ cssFormatDimension(h) } ${ cssFormatPercent(s) } ${ cssFormatPercent(v) }${ cssFormatAlpha01(a) })`;
};

