import { cssFormatAlpha01 } from "@rickosborne/css";
import { minMax } from "@rickosborne/foundation";
import { NO_THROW, type ThrowOnError } from "@rickosborne/guard";
import { colorComparatorBuilder, colorEqBuilder } from "./color-comparator.js";
import { ColorConversionError } from "./color-conversion-error.js";
import { type Float01, type Int255, type Int360, toInt255 } from "./numbers.js";

/**
 * A color with RGB values, and possibly an alpha.
 * All values are integers in the range [0,255].
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

export function parseHexRGB(text: string, options?: ThrowOnError | undefined): RGB;
export function parseHexRGB(text: string, options: typeof NO_THROW): RGB | undefined;
/**
 * Parse a hex-encoded RGB value.
 */
export function parseHexRGB(text: string, options: ThrowOnError | undefined = {}): RGB | undefined {
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
	const [ r, g, b, a ] = texts.map(toNumber) as [Int255, Int255, Int255, Int255];
	return { r, g, b, ...(a == null ? {} : { a }) };
}

export function toRGB(r255: number, g255: number, b255: number, a255: number): RGBA;
export function toRGB(r255: number, g255: number, b255: number, a255?: number | undefined): RGB;
/**
 * Build an RGB value from the given numbers, verifying they are
 * integers in the range [0,255].
 */
export function toRGB(r: number, g: number, b: number, a?: number | undefined): RGB {
	const rgb: RGB = {
		r: toInt255(r, "red"),
		g: toInt255(g, "green"),
		b: toInt255(b, "blue"),
	};
	if (a != null) {
		rgb.a = toInt255(a, "alpha");
	}
	return rgb;
}

/**
 * Calculate the chroma value for the given RGB, producing a
 * float in the range [0,1].
 */
export function chroma01FromRGB(rgb: RGB): Float01;
export function chroma01FromRGB(rgb: RGB | undefined): Float01 | undefined;
export function chroma01FromRGB(rgb: RGB | undefined): Float01 | undefined {
	if (rgb == null) {
		return undefined;
	}
	const { r, g, b } = rgb;
	const [ min255, max255 ] = minMax(r, g, b);
	return (max255 - min255) / 255 as Float01;
};

export const hue360FromRGB = (rgb: RGB, chroma01: Float01 = chroma01FromRGB(rgb)): Int360 => {
	const { r, g, b } = rgb;
	if (chroma01 === 0) {
		return 0 as Int360;
	}
	const m255 = Math.max(r, g, b);
	let hPrime;
	if (m255 === r) {
		hPrime = (g - b) / (chroma01 * 255) % 6;
	} else if (m255 === g) {
		hPrime = (b - r) / (chroma01 * 255) + 2;
	} else {
		hPrime = (r - g) / (chroma01 * 255) + 4;
	}
	return (Math.round(hPrime * 60) + 360) % 360 as Int360;
};

export const rgbComparator = colorComparatorBuilder<RGB>("rgbComparator", "r", "g", "b", "a");

export const rgbEq = colorEqBuilder<RGB>("rgbEq", [ "r", "g", "b", "a" ]);

export const cssFormatRGB = (rgb: RGB): string => {
	const { r, g, b, a } = rgb;
	return `rgb(${ r } ${ g } ${ b }${ a == null ? "" : cssFormatAlpha01(a / 255) })`;
};
