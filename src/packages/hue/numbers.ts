import { isInt } from "@rickosborne/guard";

/**
 * Branding for {@link Int255};
 * Technically superfluous, but makes errors clearer.
 */
export const int255 = Symbol("int255");

/**
 * An integer in the range [0...255].
 * Generally used for RGB color values.
 */
export type Int255 = number & { [ int255 ]: typeof int255 };

/**
 * Type guard for {@link Int255}.
 */
export const isInt255 = (value: unknown): value is Int255 => {
	return isInt(value) && value >= 0 && value <= 255;
};

/**
 * Type asserter for {@link Int255}.
 */
export function assertInt255(value: unknown, name?: string): asserts value is Int255 {
	if (!isInt255(value)) {
		let message = "Should be an integer in the range [0,255]";
		if (name != null) {
			message = name.concat(": ", message);
		}
		throw new RangeError(message);
	}
}

export function toInt255(value: number, name?: string | undefined): Int255;
export function toInt255(value: number | undefined, name?: string | undefined): Int255 | undefined
export function toInt255(value: number | undefined, name?: string | undefined): Int255 | undefined {
	if (value == null) {
		return undefined;
	}
	assertInt255(value, name);
	return value;
}

/**
 * Branding for {@link Int360};
 * Technically superfluous, but makes errors clearer.
 */
export const int360 = Symbol.for("int360");

export interface Int360Brand {
	readonly [ int360 ]: typeof int360
}

/**
 * An integer in the range [0,360).
 */
export type Int360 = number & Int360Brand;

/**
 * Type guard for {@link Int360}.
 */
export const isInt360 = (value: unknown): value is Int360 => {
	return isInt(value) && value >= 0 && value < 360;
};

/**
 * Type asserter for {@link Int360}.
 */
export function assertInt360(value: unknown, name?: string): asserts value is Int360 {
	if (!isInt360(value)) {
		let message = "Should be an integer in the range [0,360)";
		if (name != null) {
			message = name.concat(": ", message);
		}
		throw new RangeError(message);
	}
}

export function toInt360(value: number, name?: string | undefined): Int360;
export function toInt360(value: number | undefined, name?: string | undefined): Int360 | undefined;
export function toInt360(value: number | undefined, name?: string | undefined): Int360 | undefined {
	if (value == null) {
		return undefined;
	}
	assertInt360(value, name);
	return value;
}

/**
 * Branding for {@link Float01};
 * Technically superfluous, but makes errors clearer.
 */
export const float01 = Symbol("float01");

/**
 * A real number in the range [0,1].
 */
export type Float01 = number & { [ float01 ]: typeof float01 };

/**
 * Type guard for {@link Float01}.
 */
export const isFloat01 = (value: unknown): value is Float01 => {
	return typeof value === "number" && value >= 0 && value <= 1;
};

/**
 * Type asserter for {@link Int360}.
 */
export function assertFloat01(value: unknown, name?: string | undefined): asserts value is Float01 {
	if (!isFloat01(value)) {
		let message = `Should be an integer in the range [0,360): ${ typeof value === "number" ? value : "" }`;
		if (name != null) {
			message = name.concat(": ", message);
		}
		throw new RangeError(message);
	}
}

export function toFloat01(value: number, name?: string | undefined): Float01;
export function toFloat01(value: number | undefined, name?: string | undefined): Float01 | undefined;
/**
 * Upgrade the given number to a {@link Float01}.
 */
export function toFloat01(value: number | undefined, name?: string | undefined): Float01 | undefined {
	if (value == null) {
		return undefined;
	}
	assertFloat01(value, name);
	return value;
}

export function float01FromInt255(int: Int255): Float01;
export function float01FromInt255(int: Int255 | undefined): Float01 | undefined;
export function float01FromInt255(int: Int255 | undefined): Float01 | undefined {
	if (int == null) {
		return undefined;
	}
	return int / 255 as Float01;
}

export function int255FromFloat01(float01: Float01): Int255;
export function int255FromFloat01(float01: Float01 | undefined): Int255 | undefined;
export function int255FromFloat01(float01: Float01 | undefined): Int255 | undefined {
	if (float01 == null) {
		return undefined;
	}
	return Math.round(float01 * 255) as Int255;
}

export const COLOR_EPSILON = 0.0001;
