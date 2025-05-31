import type { Supplier } from "@rickosborne/typical";
import { TupleMap } from "./tuple-map.js";

/**
 * Memoize the given supplier so that it is called at most once.
 */
export const memoizeSupplier = <T>(supplier: Supplier<T>): Supplier<T> => {
	const name = supplier.name;
	let value: T;
	let done = false;
	return {
		[ name ]: (): T => {
			if (!done) {
				value = supplier();
				done = true;
			}
			return value;
		},
	}[ name ]!;
};

/**
 * Shorthand for {@link memoizeSupplier}.
 */
export const memoize = memoizeSupplier;

export const memoizeUnary = <T, U>(unary: (input: T) => U): ((input: T) => U) => {
	const cache = new Map<T, [U]>();
	return (arg: T): U => {
		const cached = cache.get(arg);
		if (cached == null) {
			const value = unary(arg);
			cache.set(arg, [ value ]);
			return value;
		}
		return cached[0];
	};
};

export const memoizeBinary = <T, U, V>(binary: (t: T, u: U) => V): ((t: T, u: U) => V) => {
	const cache = TupleMap.forKeyLength<[T, U], V, 2>(2);
	return (t: T, u: U): V => cache.getOrCompute([ t, u ], () => binary(t, u));
};


export const memoizeMore = <P extends unknown[] & { length: N }, R, N extends number>(argCount: N, fn: (...args: P) => R): ((...args: P) => R) => {
	const cache = TupleMap.forKeyLength<P, R, N>(argCount);
	return (...args: P): R => cache.getOrCompute(args, (a: P) => fn(...a));
};
