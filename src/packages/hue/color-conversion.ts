import type { Int255, Int360, Real01, Real255 } from "@rickosborne/rebound";
import { toReal01 } from "@rickosborne/rebound";
import { positiveMod } from "../foundation/modulo.js";
import type { HSL, HSLA } from "./hsl.js";
import { chroma01FromHSL } from "./hsl.js";
import type { HSV } from "./hsv.js";
import { chroma01FromHSV } from "./hsv.js";
import type { RGB01, RGB255, RGBA01 } from "./rgb.js";
import { chroma01FromRGB, chroma01FromRGB01, rgb01From255 } from "./rgb.js";

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
		s: toReal01(sl),
		l: toReal01(l),
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
	let v: Real01;
	let sv: Real01;
	if (sl === 0 && l === 0) {
		v = 0 as Real01;
		sv = 0 as Real01;
	} else {
		const l2 = l * 2;
		const s2 = sl * ((l2 <= 1) ? l2 : (2 - l2));
		v = toReal01((l2 + s2) / 2);
		sv = toReal01((2 * s2) / (l2 + s2));
	}
	return {
		h,
		s: sv,
		v,
		...(a == null ? {} : { a }),
	};
}

export const rgb01FromHueChromaMin = (
	hue360: Int360,
	chroma01: Real01,
	min: Real01,
	alpha01: Real01 | undefined,
): RGB01 => {
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
		r: toReal01(r + min),
		g: toReal01(g + min),
		b: toReal01(b + min),
		...(alpha01 == null ? {} : { a: alpha01 }),
	};
};

export function rgbFromHSL(hsl: HSL): RGB01;
export function rgbFromHSL(hsl: HSL | undefined): RGB01 | undefined;
export function rgbFromHSL(hsl: HSL | undefined): RGB01 | undefined {
	if (hsl == null) {
		return undefined;
	}
	const { a, h, l } = hsl;
	const c = chroma01FromHSL(hsl);
	const m = l - (c / 2) as Real01;
	return rgb01FromHueChromaMin(h, c, m, a);
}

export function rgbFromHSV(hsv: HSV): RGB01;
export function rgbFromHSV(hsv: HSV | undefined): RGB01 | undefined;
export function rgbFromHSV(hsv: HSV | undefined): RGB01 | undefined {
	if (hsv == null) {
		return undefined;
	}
	const { a, h, v } = hsv;
	const c = chroma01FromHSV(hsv);
	const m = v - c as Real01;
	return rgb01FromHueChromaMin(h, c, m, a);
}

const hue360From = <N extends Real255 | Real01 | Int255>(
	chroma: N, r: N, g: N, b: N, max: N | undefined,
): Int360 => {
	if (chroma === 0) {
		return 0 as Int360;
	}
	const m255 = max ?? Math.max(r, g, b);
	let hPrime;
	if (m255 === r) {
		hPrime = (g - b) / chroma;
	} else if (m255 === g) {
		hPrime = (b - r) / chroma + 2;
	} else {
		hPrime = (r - g) / chroma + 4;
	}
	return positiveMod(Math.round(hPrime * 60), 360) as Int360;
};

export function hue360FromRGB01(rgb01: RGB01, chroma01?: Real01 | undefined, max01?: Real01 | undefined): Int360;
export function hue360FromRGB01(rgb01: RGB01 | undefined, chroma01?: Real01 | undefined, max01?: Real01 | undefined): Int360 | undefined;
export function hue360FromRGB01(rgb01: RGB01 | undefined, chroma01?: Real01 | undefined, max01?: Real01 | undefined): Int360 | undefined {
	if (rgb01 == null) {
		return undefined;
	}
	const c01 = chroma01 ?? chroma01FromRGB01(rgb01);
	const { r: r01, g: g01, b: b01 } = rgb01;
	return hue360From(c01, r01, g01, b01, max01);
}

export function hue360FromRGB(rgb: RGB255, chroma01?: Real01 | undefined, max255?: Int255 | Real255 | undefined): Int360;
export function hue360FromRGB(rgb: RGB255 | undefined, chroma01?: Real01 | undefined, max255?: Int255 | Real255 | undefined): Int360 | undefined;
export function hue360FromRGB(rgb: RGB255 | undefined, chroma01?: Real01 | undefined, max255?: Int255 | Real255 | undefined): Int360 | undefined {
	if (rgb == null) {
		return undefined;
	}
	const c01 = chroma01 ?? chroma01FromRGB(rgb);
	const c255 = c01 * 255;
	const { r, g, b } = rgb;
	return hue360From<Int255 | Real255>(c255 as Int255 | Real255, r, g, b, max255);
}

export function hsvFromRGB(rgb: RGB255): HSV;
export function hsvFromRGB(rgb: RGB255 | undefined): HSV | undefined;
export function hsvFromRGB(rgb: RGB255 | undefined): HSV | undefined {
	if (rgb == null) {
		return undefined;
	}
	const { r, g, b, a: a255 } = rgb;
	const a01: Real01 | undefined = a255 == null ? undefined : toReal01(a255 / 255);
	const min255 = Math.min(r, g, b) as Real255;
	const max255 = Math.max(r, g, b) as Real255;
	let h: Int360;
	let s: Real01;
	const v = toReal01(max255 / 255);
	if (max255 === min255) {
		h = 0 as Int360;
		s = 0 as Real01;
	} else {
		const c255 = max255 - min255;
		const c01 = ((max255 - min255) / 255) as Real01;
		h = hue360FromRGB(rgb, c01, max255);
		s = toReal01(c255 / max255);
	}
	return { h, s, v, ...(a01 == null ? {} : { a: a01 }) };
}

export function hslFromRGB01(rgba01: RGBA01): HSLA;
export function hslFromRGB01(rgb01: RGB01): HSL;
export function hslFromRGB01(rgb01: RGB01 | undefined): HSL | undefined;
export function hslFromRGB01(rgb01: RGB01 | undefined): HSL | undefined {
	if (rgb01 == null) {
		return undefined;
	}
	const { r: r01, g: g01, b: b01, a: a01 } = rgb01;
	const min01 = Math.min(r01, g01, b01) as Real01;
	const max01 = Math.max(r01, g01, b01) as Real01;
	const sum01 = max01 + min01;
	// L = (M + m) / 2
	const l: Real01 = toReal01(sum01 / 2, "luminosity");
	let h: Int360;
	let s: Real01;
	if (l === 0 || l === 1) {
		h = 0 as Int360;
		s = 0 as Real01;
	} else {
		// C = M - m
		const c01 = toReal01(max01 - min01);
		// S = C / (1 - Math.abs(2 * L - 1));
		// L <= 0.5 => S = C / (2 * L)
		// L >  0.5 => S = C / (2 - (2 * L))
		if (l <= 0.5) {
			s = toReal01(c01 / sum01, "saturation");
		} else {
			s = toReal01(c01 / (2 - sum01), "saturation");
		}
		h = hue360FromRGB01(rgb01, c01, max01);
	}
	return { h, s, l, ...(a01 == null ? {} : { a: a01 }) };
}

export function hslFromRGB(rgb: RGB255): HSL;
export function hslFromRGB(rgb: RGB255 | undefined): HSL | undefined;
export function hslFromRGB(rgb: RGB255 | undefined): HSL | undefined {
	if (rgb == null) {
		return undefined;
	}
	const rgb01 = rgb01From255(rgb);
	return hslFromRGB01(rgb01);
}
