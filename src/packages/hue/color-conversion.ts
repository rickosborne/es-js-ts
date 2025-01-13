import { chroma01FromHSL, type HSL } from "./hsl.js";
import { chroma01FromHSV, type HSV } from "./hsv.js";
import { type Float01, type Int360, toFloat01, toInt255 } from "./numbers.js";
import type { RGB } from "./rgb.js";

export function hslFromHSV(hsv: HSV): HSL;
export function hslFromHSV(hsv: HSV | undefined): HSL | undefined;
/**
 * Convert to HSL from HSV.
 * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV | HSL and HSV on Wikipedia}
 */
export function hslFromHSV(hsv: HSV | undefined): HSL | undefined {
	if (hsv == null) {
		return undefined;
	}
	const { a, h, s: sv, v } = hsv;
	let sl = sv * v;
	let l = (2 - sv) * v;
	if (l === 0 || l === 2) {
		sl = 0;
	} else {
		sl /= l <= 1 ? l : (2 - l);
	}
	l /= 2;
	return {
		h,
		s: toFloat01(sl),
		l: toFloat01(l),
		...(a == null ? {} : { a }),
	};
}

export function hsvFromHSL(hsl: HSL): HSV;
export function hsvFromHSL(hsl: HSL | undefined): HSV | undefined;
/**
 * Convert to HSV from HSL.
 * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV | HSL and HSV on Wikipedia}
 */
export function hsvFromHSL(hsl: HSL | undefined): HSV | undefined {
	if (hsl == null) {
		return undefined;
	}
	const { a, h, s: sl, l } = hsl;
	let v: Float01;
	let sv: Float01;
	if (sl === 0 && l === 0) {
		v = 0 as Float01;
		sv = 0 as Float01;
	} else {
		const l2 = l * 2;
		const s2 = sl * ((l2 <= 1) ? l2 : (2 - l2));
		v = toFloat01((l2 + s2) / 2);
		sv = toFloat01((2 * s2) / (l2 + s2));
	}
	return {
		h,
		s: sv,
		v,
		...(a == null ? {} : { a }),
	};
}

export const rgbFromHueChromaMin = (
	hue360: Int360,
	chroma01: Float01,
	min: Float01,
	alpha01: Float01 | undefined,
): RGB => {
	const hPrime = hue360 / 60;
	const x = chroma01 * (1 - Math.abs((hPrime % 2) - 1));
	const hP = Math.trunc(hPrime);
	let r, g, b;
	if (hP === 0) {
		[ r, g, b ] = [ chroma01, x, 0 ];
	} else if (hP === 1) {
		[ r, g, b ] = [ x, chroma01, 0 ];
	} else if (hP === 2) {
		[ r, g, b ] = [ 0, chroma01, x ];
	} else if (hP === 3) {
		[ r, g, b ] = [ 0, x, chroma01 ];
	} else if (hP === 4) {
		[ r, g, b ] = [ x, 0, chroma01 ];
	} else if (hP === 5) {
		[ r, g, b ] = [ chroma01, 0, x ];
	} else {
		throw new RangeError(`Expected h' to be in range [0,6): ${ hPrime }`);
	}
	return {
		r: toInt255(Math.round((r + min) * 255)),
		g: toInt255(Math.round((g + min) * 255)),
		b: toInt255(Math.round((b + min) * 255)),
		...(alpha01 == null ? {} : { a: toInt255(alpha01 * 255) }),
	};
};

export function rgbFromHSL(hsl: HSL): RGB;
export function rgbFromHSL(hsl: HSL | undefined): RGB | undefined;
export function rgbFromHSL(hsl: HSL | undefined): RGB | undefined {
	if (hsl == null) {
		return undefined;
	}
	const { a, h, l } = hsl;
	const c = chroma01FromHSL(hsl);
	const m = l - (c / 2) as Float01;
	return rgbFromHueChromaMin(h, c, m, a);
}

export function rgbFromHSV(hsv: HSV): RGB;
export function rgbFromHSV(hsv: HSV | undefined): RGB | undefined;
export function rgbFromHSV(hsv: HSV | undefined): RGB | undefined {
	if (hsv == null) {
		return undefined;
	}
	const { a, h, v } = hsv;
	const c = chroma01FromHSV(hsv);
	const m = v - c as Float01;
	return rgbFromHueChromaMin(h, c, m, a);
}
