import { randomNumberGenerator } from "@rickosborne/foundation";
import type { TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface RandomBounded<N extends number> extends TypedCheckedBounds {
	(): N;
}

export const randomBounded = <
	N extends number,
>(
	typeName: string,
	label: string,
	isLowerInc: boolean,
	lower: number,
	isInt: boolean,
	upper: number,
	isUpperInc: boolean,
	rng: ({ float01(): number; range(low: number, high: number): number; }) = randomNumberGenerator(),
	fnName: string = `random${ typeName }`,
): RandomBounded<N> => {
	if (!Number.isFinite(upper) || !Number.isFinite(lower)) {
		throw new RangeError(`${ typeName }: Unbounded random`);
	}
	const high = upper + (isUpperInc ? isInt ? 1 : Number.MIN_VALUE : 0);
	let low = lower + (isLowerInc ? 0 : isInt ? 1 : Number.MIN_VALUE);
	const range = high - low;
	const minRange = isInt ? 2 : (2 * Number.MIN_VALUE);
	let fn: () => N;
	if (range < minRange) {
		throw new RangeError(`${ typeName }: Random range too narrow`);
	} else if (isInt) {
		fn = () => rng.range(low, high) as N;
	} else {
		fn = () => (rng.float01() * range) + low as N;
	}
	return addTypedProperties(fn, {
		label, upper, lower, isUpperInc, isLowerInc, isInt,
	}, typeName, fnName);
};
