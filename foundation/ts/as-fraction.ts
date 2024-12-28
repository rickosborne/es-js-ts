import { signOf } from "@rickosborne/planar";
import { closeToZero } from "./close-to.js";

/**
 * Try to find a human-readable fraction for the given decimal value,
 * within a given percentage error, in the form of a
 * <kbd>[ numerator, denominator ]</kbd> tuple, where both values
 * are integers.
 * See {@link https://stackoverflow.com/a/45314258 | the original algorithm by Sjaak}.
 * If the given value is negative, it the numerator will be negative.
 * The denominator is always positive, and at least 1.
 */
export const asFraction = (num: number, percentError: number = 0.000001): [ number, number ] => {
	if (isNaN(num)) {
		return [ NaN, 1 ];
	}
	if (num === Infinity) {
		return [ Infinity, 1 ];
	}
	if (num === -Infinity) {
		return [ -Infinity, 1 ];
	}
	if (percentError <= 0 || percentError >= 1) {
		throw new RangeError("percentError should be in the range (0,1)");
	}
	if (closeToZero(num, percentError)) {
		return [ 0, 1 ];
	}
	const sign = signOf(num);
	const value = sign < 0 ? -num : num;
	const epsilon = value * percentError;
	const intPart = Math.trunc(value);
	const fracPart = value - intPart;
	const floatMin = fracPart - epsilon;
	if (floatMin < 0) {
		return [ sign * intPart, 1 ];
	}
	const floatMax = fracPart + epsilon;
	if (floatMax > 1) {
		return [ sign * (1 + intPart), 1 ];
	}
	let intA = 0;
	let intB = 1;
	let intC = 1;
	let intD = Math.trunc(1 / floatMax);
	let more = true;
	do {
		const intN = Math.trunc((intB * floatMin - intA) / (intC - intD * floatMin));
		if (intN === 0) {
			more = false;
		} else {
			intA += intN * intC;
			intB += intN * intD;
			const intX = Math.trunc((intC - intD * floatMax) / (intB * floatMax - intA));
			if (intX === 0) {
				more = false;
			} else {
				intC += intX * intA;
				intD += intX * intB;
			}
		}
	} while (more);
	const denominator = intB + intD;
	const numerator = sign * (intPart * denominator + (intA + intC));
	return [ numerator, denominator ];
};
