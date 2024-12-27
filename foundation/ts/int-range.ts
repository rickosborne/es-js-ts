import { hasOwn } from "@rickosborne/guard";
import type { UnaryPredicate } from "@rickosborne/typical";
import { addProperty } from "./add-property.js";

/**
 * Mixin for a generator which also has the ability to bundle
 * its output into an array.
 */
export type IntGenerator = Generator<number, void, undefined> & {
	toArray(): number[];
};

/**
 * Partial for the last step of an {@link IntRange} builder.
 */
export type IntGeneratorTo = {
	/**
	 * End before this number.
	 */
	toExclusive(stopExclusive: number): IntGenerator;
	/**
	 * End after this number.
	 */
	toInclusive(stopInclusive: number): IntGenerator;
}

/**
 * Integer range generators which (hopefully) make it super clear what
 * your boundary, direction, and increment are.
 */
export type IntRange = {
	/**
	 * Start with the given number, inclusively.
	 */
	from(startInclusive: number): {
		/**
		 * Increment/decrement by this number.
		 */
		by(skip: number): IntGeneratorTo;
		/**
		 * Decrement by 1.
		 */
		get down(): IntGeneratorTo;
		/**
		 * Increment by 1.
		 */
		get up(): IntGeneratorTo;
	}
}

/**
 * Start generating a range of integers.
 */
export const intRange: IntRange = {
	from(startInclusive: number) {
		let skipBy: number = 1;
		let stop: number;
		let inclusive = false;
		const generatorFn = function* (): Generator<number, void, undefined> {
			let more: UnaryPredicate<number>;
			if (skipBy < 0) {
				more = inclusive ? ((n) => n >= stop) : ((n) => n > stop);
			} else {
				more = inclusive ? ((n) => n <= stop) : ((n) => n < stop);
			}
			for (let i = startInclusive; more(i); i += skipBy) {
				yield i;
			}
		};
		const addToArray = (gen: Generator<number, void, undefined>): IntGenerator => {
			if (hasOwn(gen, "toArray", (f) => typeof f === "function")) {
				return gen as IntGenerator;
			}
			return addProperty(gen, "toArray", {
				configurable: false,
				enumerable: false,
				value: () => Array.from(generatorFn()),
				writable: false,
			});
		};
		const toExclusive = (stopExclusive: number): IntGenerator => {
			stop = stopExclusive;
			inclusive = false;
			return addToArray(generatorFn());
		};
		const toInclusive = (stopInclusive: number): IntGenerator => {
			stop = stopInclusive;
			inclusive = true;
			return addToArray(generatorFn());
		};
		const by = (skip: number) => {
			skipBy = skip;
			return { toExclusive, toInclusive };
		};
		return {
			by,
			get down(): IntGeneratorTo {
				skipBy = -1;
				return { toExclusive, toInclusive };
			},
			get up(): IntGeneratorTo {
				skipBy = 1;
				return { toExclusive, toInclusive };
			},
		};
	},
};
