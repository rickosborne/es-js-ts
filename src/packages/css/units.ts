import { CSSError } from "./css-error.js";
import { HREF_DIMENSION } from "./href.js";

/**
 * A CSS dimension, a number and an optional unit, as a tuple.
 */
export type DimensionPair = [ value: number, units: string | undefined ];

/**
 * Variation of a {@link DimensionPair} where the value may not be present.
 */
export type OptionalDimensionPair = [ value: number | undefined, units: string | undefined ];

/**
 * Given a number and a lookup table of units, convert the number
 * from the source units to the destination units.
 */
export const convertBetweenUnits = <Unit extends string, NumberFormat extends number>(
	original: number | undefined,
	fromUnit: Unit,
	toUnit: Unit,
	conversions: Readonly<Record<Unit, number>>,
	format?: (num: number) => NumberFormat,
): NumberFormat | undefined => {
	if (original == null) {
		return undefined;
	}
	const divisor = conversions[ fromUnit ];
	const numerator = conversions[ toUnit ];
	if (divisor == null || numerator == null) {
		return undefined;
	}
	let converted: number;
	if (divisor === numerator) {
		converted = original;
	} else {
		converted = original * numerator / divisor;
	}
	return format?.(converted) ?? (converted as NumberFormat);
};

export const dimensionFromCSS = (text: string | undefined): OptionalDimensionPair => {
	if (text == null || text.trim() === "") {
		return [ undefined, undefined ];
	}
	let t = text.trim().toLowerCase();
	if (t === "none" || t === "0") {
		return [ 0, undefined ];
	}
	const numMatch = /^-?\d+(?:\.\d*)?/.exec(t);
	if (numMatch == null) {
		throw new CSSError(text, { expected: "Number", href: HREF_DIMENSION });
	}
	const real = numMatch[ 0 ];
	t = t.substring(real.length).trim();
	const value = parseFloat(real);
	if (t === "") {
		return [ value, undefined ];
	}
	if (t === "%" || /^\p{ID_Start}\p{ID_Continue}*$/u.test(t)) {
		return [ value, t.toLowerCase() ];
	}
	throw new CSSError(text, { expected: "Unit", href: HREF_DIMENSION, message: `Non-unit after number: ${ t }` });
};
