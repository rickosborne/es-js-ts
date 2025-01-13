import { CSSError } from "./css-error.js";
import { HREF_ANGLE } from "./href.js";
import { convertBetweenUnits, dimensionFromCSS } from "./units.js";

/**
 * Unit for a CSS angle.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/angle | CSS angle on MDN}
 */
export type CSSAngleUnit = "%" | "deg" | "grad" | "rad" | "turn";

/**
 * List of {@link CSSAngleUnit}.
 */
export const ANGLE_UNITS: Readonly<CSSAngleUnit[]> = Object.freeze([ "deg", "grad", "rad", "turn", "%" ]);
let angleUnitsSet: Set<CSSAngleUnit> | undefined;

/**
 * Type guard for {@link CSSAngleUnit}.
 */
export const isAngleUnit = (obj: unknown): obj is CSSAngleUnit => {
	if (typeof obj !== "string") {
		return false;
	}
	angleUnitsSet ??= new Set(ANGLE_UNITS);
	return angleUnitsSet.has(obj as CSSAngleUnit);
};

export const ANGLE_CONVERSIONS: Readonly<Record<CSSAngleUnit, number>> = Object.freeze({
	"%": 100,
	deg: 360,
	grad: 400,
	rad: Math.PI * 2,
	turn: 1,
});

export const angle01FromCSS = (text: string | undefined, defaultUnit: CSSAngleUnit = "deg"): number | undefined => {
	if (text == null) {
		return undefined;
	}
	const [ value, unit = defaultUnit ] = dimensionFromCSS(text);
	if (!(unit in ANGLE_CONVERSIONS)) {
		throw new CSSError(text, { expected: "Angle", href: HREF_ANGLE, message: `Unknown CSS angle unit: ${ unit }` });
	}
	return convertBetweenUnits<CSSAngleUnit, number>(value, unit as CSSAngleUnit, "turn", ANGLE_CONVERSIONS);
};
