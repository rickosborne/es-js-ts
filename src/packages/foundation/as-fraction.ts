import { closeToZero } from "./close-to.js";

/**
 * A fraction represented as a tuple of numerator and
 * denominator.
 * The numerator is negative if the value is negative.
 * The denominator is always positive, and at least 1.
 * Both values are integers, though the numerator may
 * be Infinity or NaN as the value requires.
 */
export type FracTuple = [ numerator: number, denominator: number ];

/**
 * Try to find a human-readable fraction for the given decimal value,
 * within a given percentage error.
 * See {@link https://stackoverflow.com/a/45314258 | the original algorithm by Sjaak}.
 */
export const asFraction = (num: number, percentError: number = 0.000001): FracTuple => {
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
	const sign = num === 0 ? 0 : num < 0 ? -1 : 1;
	const value = sign < 0 ? -num : num;
	const epsilon = value * percentError;
	const intPart = Math.trunc(value);
	const fracPart = value - intPart;
	const realMin = fracPart - epsilon;
	if (realMin < 0) {
		return [ sign * intPart, 1 ];
	}
	const realMax = fracPart + epsilon;
	if (realMax > 1) {
		return [ sign * (1 + intPart), 1 ];
	}
	let intA = 0;
	let intB = 1;
	let intC = 1;
	let intD = Math.trunc(1 / realMax);
	let more = true;
	do {
		const intN = Math.trunc((intB * realMin - intA) / (intC - intD * realMin));
		if (intN === 0) {
			more = false;
		} else {
			intA += intN * intC;
			intB += intN * intD;
			const intX = Math.trunc((intC - intD * realMax) / (intB * realMax - intA));
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
