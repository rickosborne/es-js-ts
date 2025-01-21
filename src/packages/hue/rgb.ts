import { cssFormatAlpha01, cssFormatHex } from "@rickosborne/css";
import { type Int255, minMax, type Real01, type Real255, roundBound, toReal255 } from "@rickosborne/foundation";
import { NO_THROW, type ThrowOnError } from "@rickosborne/guard";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";
import { ColorConversionError } from "./color-conversion-error.js";

/**
 * A color with RGB values, and possibly an alpha.
 * All values are integers in the range [0..255].
 */
export interface RGB {
	a?: Int255 | undefined;
	b: Int255;
	g: Int255;
	r: Int255;
}

/**
 * A color with RGBA values.
 * All values are integers in the range [0,255].
 */
export interface RGBA extends RGB {
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
export type RGB255 = RGB | RealRGB;
export type RGBA255 = RGBA | RealRGBA;

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

export function rgbFromHex(text: string, options?: ThrowOnError | undefined): RGB;
export function rgbFromHex(text: string | undefined, options: typeof NO_THROW): RGB | undefined;
/**
 * Parse a hex-encoded RGB value.
 */
export function rgbFromHex(text: string | undefined, options: ThrowOnError | undefined = {}): RGB | undefined {
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
export function chroma01FromRGB(rgb: RGB255): Real01;
export function chroma01FromRGB(rgb: RGB255 | undefined): Real01 | undefined;
export function chroma01FromRGB(rgb: RGB255 | undefined): Real01 | undefined {
	if (rgb == null) {
		return undefined;
	}
	const { r, g, b } = rgb;
	const [ min255, max255 ] = minMax(r, g, b);
	return (max255 - min255) / 255 as Real01;
}

export const rgbComparator = colorComparatorBuilder<RGB>("rgbComparator", "r", "g", "b", "a");

export const rgbEq = colorEqBuilder<RGB255>("rgbEq", [ "r", "g", "b", "a" ], { r: 2, g: 2, b: 2, a: 2 });

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

export function rgbFromReal(real: RealRGBA): RGBA;
export function rgbFromReal(real: RealRGB): RGB;
export function rgbFromReal(real: RealRGB | undefined): RGB | undefined;
export function rgbFromReal(real: RealRGB | undefined): RGB | undefined {
	return real == null ? undefined : {
		...(real.a == null ? {} : { a: roundBound(real.a) }),
		b: roundBound(real.b),
		g: roundBound(real.g),
		r: roundBound(real.r),
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

