import { INFINITY_SIGIL, PI_SIGIL, asFraction, closeToZero } from "@rickosborne/foundation";
import { EPSILON, PI } from "./constant.js";
import { signOf } from "./sign-of.js";

/**
 * Try to figure out a reasonably human-readable fraction for the given
 * angle in radians.
 */
export const prettyRad = (
	rad: number,
	epsilon: number = EPSILON,
): string => {
	if (closeToZero(rad, epsilon)) return "0";
	const sign = signOf(rad) < 0 ? "-" : "";
	const mult = Math.abs(rad / PI);
	const [ numerator, denominator ] = asFraction(mult, epsilon);
	let num: string;
	if (isNaN(numerator)) {
		num = "NaN";
	} else if (numerator == 1) {
		num = "";
	} else if (numerator === Infinity) {
		num = INFINITY_SIGIL;
	} else {
		num = String(numerator);
	}
	const top = `${ sign }${ num }${ PI_SIGIL }`;
	if (denominator === 1) {
		return top;
	}
	return `${ top }/${ denominator }`;
};
