import type { Supplier } from "@rickosborne/typical";

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
	}[ name ];
};

/**
 * Shorthand for {@link memoizeSupplier}.
 */
export const memoize = memoizeSupplier;
