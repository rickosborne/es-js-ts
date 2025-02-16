/**
 * @see {@link https://www.w3.org/TR/css-values-4/#relative-lengths | CSS Level 4 Relative Lengths}
 */
export type CSSRelativeLengthUnit = "em" | "ex" | "cap" | "ch" | "ic" | "rem" | "lh" | "rlh" | "vw" | "vh" | "vi" | "vb" | "vmin" | "vmax" | "svw" | "lvw" | "dvw" | "svh" | "lvh" | "dvh" | "svi" | "lvi" | "dvi" | "svb" | "lvb" | "dvb" | "svmin" | "lvmin" | "dvmin" | "svmax" | "lvmax" | "dvmax";

/**
 * List of {@link CSSRelativeLengthUnit}.
 */
export const RELATIVE_LENGTH_UNITS: Readonly<CSSRelativeLengthUnit[]> = Object.freeze([ "em", "ex", "cap", "ch", "ic", "rem", "lh", "rlh", "vw", "vh", "vi", "vb", "vmin", "vmax", "svw", "lvw", "dvw", "svh", "lvh", "dvh", "svi", "lvi", "dvi", "svb", "lvb", "dvb", "svmin", "lvmin", "dvmin", "svmax", "lvmax", "dvmax" ]);
let relativeLengthUnitSet: Set<CSSRelativeLengthUnit> | undefined;

/**
 * Type guard for {@link CSSRelativeLengthUnit}.
 */
export const isRelativeLengthUnit = (obj: unknown): obj is CSSRelativeLengthUnit => {
	if (typeof obj !== "string") {
		return false;
	}
	relativeLengthUnitSet ??= new Set(RELATIVE_LENGTH_UNITS);
	return relativeLengthUnitSet.has(obj as CSSRelativeLengthUnit);
};

/**
 * @see {@link https://www.w3.org/TR/css-values-4/#absolute-lengths | CSS Level 4 Absolute Lengths}
 */
export type CSSAbsoluteLengthUnit = "cm" | "mm" | "Q" | "in" | "pt" | "pc" | "px";

/**
 * List of {@link CSSAbsoluteLengthUnit}.
 */
export const ABSOLUTE_LENGTH_UNITS: Readonly<CSSAbsoluteLengthUnit[]> = Object.freeze([ "cm", "mm", "Q", "in", "pt", "pc", "px" ]);
let absoluteLengthUnitSet: Set<CSSAbsoluteLengthUnit> | undefined;

/**
 * Type guard for {@link CSSAbsoluteLengthUnit}.
 */
export const isAbsoluteLengthUnit = (obj: unknown): obj is CSSAbsoluteLengthUnit => {
	if (typeof obj !== "string") {
		return false;
	}
	absoluteLengthUnitSet ??= new Set(ABSOLUTE_LENGTH_UNITS);
	return absoluteLengthUnitSet.has(obj as CSSAbsoluteLengthUnit);
};

/**
 * @see {@link https://www.w3.org/TR/css-values-4/#lengths | CSS Level 4 Distance Units}
 */
export type CSSLengthUnit = CSSRelativeLengthUnit | CSSAbsoluteLengthUnit;

/**
 * Type guard for {@link CSSLengthUnit}.
 */
export const isLengthUnit = (obj: unknown): obj is CSSLengthUnit => {
	return isAbsoluteLengthUnit(obj) || isRelativeLengthUnit(obj);
};

/**
 * Approximations of useful resolutions for various CSS units.
 */
export const RESOLUTION_BY_UNIT: Record<string, number | undefined> = Object.freeze({
	"%": 0.1,
	cm: 0.01,
	deg: 0.1,
	"in": 0.01,
	mm: 0.1,
	pc: 0.1,
	pt: 0.1,
	px: 1,
	Q: 0.1,
	em: 0.01,
	rem: 0.01,
	vw: 0.001,
	vh: 0.001,
});
