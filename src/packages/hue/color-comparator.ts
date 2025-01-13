import { closeTo } from "@rickosborne/foundation";
import { A_GT_B, A_LT_B, type Comparator, EQ } from "@rickosborne/typical";
import { COLOR_EPSILON, type Float01, type Int255, type Int360 } from "./numbers.js";

/**
 * Remove the branding from number values, to make type operations
 * less onerous for generics.
 */
export type UnbrandedNumbers<C extends object> = {
	[K in keyof C as Int360 extends C[K] ? K : Float01 extends C[K] ? K : Int255 extends C[K] ? K : number extends C[K] ? K : never]: number;
}

/**
 * Generator for color comparators, since they all follow the same
 * pattern of working through number values.  This sorts null values
 * after defined ones.
 */
export const colorComparatorBuilder = <C extends object>(
	fnName: string,
	...keys: (keyof UnbrandedNumbers<C>)[]
): Comparator<C | undefined> => {
	const comparator = {
		[fnName]: (a: C | undefined, b: C | undefined): number => {
			if (a === b) {
				return EQ;
			}
			if (a == null) {
				return A_GT_B;
			}
			if (b == null) {
				return A_LT_B;
			}
			for (const key of keys) {
				const aValue = a[ key ] as number;
				const bValue = b[ key ] as number;
				if (aValue === bValue) {
					continue;
				}
				if (aValue == null) {
					return A_GT_B;
				}
				if (bValue == null) {
					return A_LT_B;
				}
				return aValue - bValue;
			}
			return EQ;
		},
	}[fnName];
	return comparator!;
};

/**
 * A function which checks two colors for equivalence, within some
 * tolerable margin of error.
 */
export type ColorCloseTo<C extends object> = (a: C | undefined, b: C | undefined, epsilon?: number | undefined) => boolean;

/**
 * Generator for color equality functions, since they all follow
 * the same pattern of iterating over keys and doing delta checks.
 */
export const colorEqBuilder = <C extends object>(
	fnName: string,
	keys: (keyof UnbrandedNumbers<C>)[],
	defaultEpsilon = COLOR_EPSILON,
): ColorCloseTo<C> => {
	const predicate = {
		[fnName]: (a: C | undefined, b: C | undefined, epsilon = defaultEpsilon): boolean => {
			if (a == null && b == null) {
				return true;
			}
			if (a == null || b == null) {
				return false;
			}
			if (a === b) {
				return true;
			}
			for (const key of keys) {
				const aValue = a[ key ] as number;
				const bValue = b[ key ] as number;
				if (aValue === bValue) {
					continue;
				}
				if ((aValue == null) !== (bValue == null)) {
					return false;
				}
				if (!closeTo(aValue, bValue, epsilon)) {
					return false;
				}
			}
			return true;
		},
	}[fnName];
	return predicate!;
};
