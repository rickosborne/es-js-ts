import { cssFormatAlpha01, cssFormatHex } from "@rickosborne/css";
import { minMax } from "@rickosborne/foundation";
import type { NO_THROW } from "@rickosborne/guard";
import type { ThrowOnError } from "@rickosborne/guard";
import type { Int255, Real01, Real255 } from "@rickosborne/rebound";
import { int255, int255From01, toReal255 } from "@rickosborne/rebound";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";
import { ColorConversionError } from "./color-conversion-error.js";

/**
 * A color with RGB values, and possibly an alpha.
 * All values are integers in the range [0..255].
 */
export interface IntRGB {
	a?: Int255 | undefined;
	b: Int255;
	g: Int255;
	r: Int255;
}

/**
 * A color with RGBA values.
 * All values are integers in the range [0,255].
 */
export interface IntRGBA extends IntRGB {
	a: Int255;
}

/**
 * A color with RGB values, and possibly an alpha.
 * All values are real numbers in the range [0,255].
 */
export interface RealRGB {
	a?: Real255 | undefined;
	b: Real255;
	g: Real255;
	r: Real255;
}

/**
 * A color with RGBA values.
 * All values are real numbers in the range [0,255].
 */
export interface RealRGBA extends RealRGB {
	a: Real255;
}

/**
 * A color with RGB values, and possibly an alpha.
 * All values are numbers in the range [0,255].
 */
export type RGB255 = IntRGB | RealRGB;
export type RGBA255 = IntRGBA | RealRGBA;

/**
 * A color with RGB values, and possibly an alpha.
 * All values are real numbers in the range [0,1].
 */
export interface RGB01 {
	a?: Real01 | undefined;
	b: Real01;
	g: Real01;
	r: Real01;
}

export interface RGBA01 extends RGB01 {
	a: Real01;
}

export function rgbFromHex(text: string, options?: ThrowOnError | undefined): IntRGB;
export function rgbFromHex(text: string | undefined, options: typeof NO_THROW): IntRGB | undefined;
/**
 * Parse a hex-encoded RGB value.
 */
export function rgbFromHex(text: string | undefined, options: ThrowOnError | undefined = {}): IntRGB | undefined {
	if (text == null) {
		return undefined;
	}
	let t = text;
	if (t.startsWith("#")) {
		t = t.substring(1);
	}
	let toNumber: (s: string) => Int255;
	let texts: string[];
	if (t.length === 3 || t.length === 4) {
		texts = t.split("");
		toNumber = (s) => {
			const n = parseInt(s, 16);
			return n * 16 + n as Int255;
		};
	} else if (t.length === 6 || t.length === 8) {
		texts = [
			t.substring(0, 2),
			t.substring(2, 4),
			t.substring(4, 6),
		];
		if (t.length === 8) {
			texts.push(t.substring(6));
		}
		toNumber = (s) => parseInt(s, 16) as Int255;
	} else {
		if (options.throwOnError === false) {
			return undefined;
		}
		throw new ColorConversionError("RGB", text, { message: "Expected a hex value" });
	}
	const [ r, g, b, a ] = texts.map(toNumber) as [ Int255, Int255, Int255, Int255 ];
	return { r, g, b, ...(a == null ? {} : { a }) };
}

export function toRGB(r255: number, g255: number, b255: number, a255: number): RGBA255;
export function toRGB(r255: number, g255: number, b255: number, a255?: number | undefined): RGB255;
/**
 * Build an RGB value from the given numbers, verifying they are
 * integers in the range [0,255].
 */
export function toRGB(r: number, g: number, b: number, a?: number | undefined): RGB255 {
	const rgb: RealRGB = {
		r: toReal255(r, "red"),
		g: toReal255(g, "green"),
		b: toReal255(b, "blue"),
	};
	if (a != null) {
		rgb.a = toReal255(a, "alpha");
	}
	return rgb;
}

/**
 * Calculate the chroma value for the given RGB, producing a
 * real number in the range [0,1].
 */
export function chroma01FromRGB01(rgb: RGB01): Real01;
export function chroma01FromRGB01(rgb: RGB01 | undefined): Real01 | undefined;
export function chroma01FromRGB01(rgb: RGB01 | undefined): Real01 | undefined {
	if (rgb == null) {
		return undefined;
	}
	const { r, g, b } = rgb;
	const [ min01, max01 ] = minMax(r, g, b);
	return (max01 - min01) as Real01;
}

export function chroma01FromRGB(rgb: RGB255): Real01;
export function chroma01FromRGB(rgb: RGB255 | undefined): Real01 | undefined;
export function chroma01FromRGB(rgb: RGB255 | undefined): Real01 | undefined {
	return chroma01FromRGB01(rgb01From255(rgb));
}

export const rgbComparator = colorComparatorBuilder<IntRGB>("rgbComparator", "r", "g", "b", "a");

export const rgbEq = colorEqBuilder<RGB255 | RGB01>("rgbEq", [ "r", "g", "b", "a" ], { r: 2, g: 2, b: 2, a: 2 });

export const cssFormatRGB = (rgb: RGB255): string => {
	const { r, g, b, a } = rgb;
	return `rgb(${ r } ${ g } ${ b }${ a == null ? "" : cssFormatAlpha01(a / 255) })`;
};

export const hexFromRGB = (rgb: RGB255, format?: "short" | "long"): string => {
	const digits = [ rgb.r, rgb.g, rgb.b ];
	if (rgb.a != null && rgb.a !== 255) {
		digits.push(rgb.a);
	}
	const hex = digits.map((n) => {
		let d = Math.round(n).toString(16);
		if (d.length > 2) {
			throw new RangeError(`RGB out of range: ${ n } ${ d }`);
		}
		if (d.length < 2) {
			return "0".repeat(2 - d.length).concat(d);
		}
		return d;
	}).join("");
	return cssFormatHex(hex, format);
};

export function rgbFromReal(real: RealRGBA): IntRGBA;
export function rgbFromReal(real: RealRGB): IntRGB;
export function rgbFromReal(real: RealRGB | undefined): IntRGB | undefined;
export function rgbFromReal(real: RealRGB | undefined): IntRGB | undefined {
	return real == null ? undefined : {
		...(real.a == null ? {} : { a: int255.round(real.a) }),
		b: int255.round(real.b),
		g: int255.round(real.g),
		r: int255.round(real.r),
	};
}

export function rgbIntFrom01(rgba01: RGBA01): IntRGBA;
export function rgbIntFrom01(rgb01: RGB01): IntRGB;
export function rgbIntFrom01(rgb01: RGB01 | undefined): IntRGB | undefined;
export function rgbIntFrom01(rgb01: RGB01 | undefined): IntRGB | undefined {
	return rgb01 == null ? undefined : {
		...(rgb01.a == null ? {} : { a: int255From01(rgb01.a) }),
		b: int255From01(rgb01.b),
		g: int255From01(rgb01.g),
		r: int255From01(rgb01.r),
	};
}


export function rgb255From01(rgb: RGB01): RealRGB;
export function rgb255From01(rgb: RGB01 | undefined): RealRGB | undefined;
export function rgb255From01(rgb: RGB01 | undefined): RealRGB | undefined {
	return rgb == null ? undefined : {
		...(rgb.a == null ? {} : { a: rgb.a * 255 as Real255 }),
		b: rgb.b * 255 as Real255,
		g: rgb.g * 255 as Real255,
		r: rgb.r * 255 as Real255,
	};
}

export function rgb01From255(rgb: RGB255): RGB01;
export function rgb01From255(rgb: RGB255 | undefined): RGB01 | undefined;
export function rgb01From255(rgb: RGB255 | undefined): RGB01 | undefined {
	return rgb == null ? undefined : {
		...(rgb.a == null ? {} : { a: rgb.a / 255 as Real01 }),
		b: rgb.b / 255 as Real01,
		g: rgb.g / 255 as Real01,
		r: rgb.r / 255 as Real01,
	};
}

