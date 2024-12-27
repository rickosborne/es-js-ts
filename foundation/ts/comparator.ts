import { assertDefined } from "@rickosborne/guard";
import { Comparator } from "@rickosborne/typical";

/**
 * Mixin for a comparator with chaining functions to constrain
 * the behavior of the comparator.
 */
export type ChainableComparator<T> = Comparator<T> & {
	/**
	 * Reverse the comparator.
	 */
	get desc(): ChainableComparator<T>;
	/**
	 * Return null and undefined values before the rest.
	 */
	get nullsFirst(): ChainableComparator<T | undefined | null>;
	/**
	 * Return null and undefined values after the rest.
	 */
	get nullsLast(): ChainableComparator<T | undefined | null>;
};

/**
 * Wrap the given comparator to return null and undefined values
 * before the others.
 */
export const withNullsFirst = <T>(comparator: Comparator<T>): Comparator<T | null | undefined> => {
	return function nullsFirst(a, b) {
		if (a == null && b == null) {
			return 0;
		} else if (a == null) {
			return -1;
		} else if (b == null) {
			return 1;
		}
		return comparator(a, b);
	};
};

/**
 * Wrap the given comparator to return null and undefined values
 * after the others.
 */
export const withNullsLast = <T>(comparator: Comparator<T>): Comparator<T | null | undefined> => {
	return function nullsLast(a, b) {
		if (a == null && b == null) {
			return 0;
		} else if (a == null) {
			return 1;
		} else if (b == null) {
			return -1;
		}
		return comparator(a, b);
	};
};

/**
 * Wrap the given comparator to invert its result.
 */
const withDesc = <T>(comparator: Comparator<T>): Comparator<T> => function desc(a, b) {
	return comparator(b, a);
};

/**
 * Wrap the given comparator so you can chain {@link ChainableComparator}
 * functions from it.
 */
export const chainableComparator = <T>(comparator: Comparator<T>): ChainableComparator<T> => {
	let _nullsFirst: ChainableComparator<T | null | undefined> | undefined;
	let _nullsLast: ChainableComparator<T | null | undefined> | undefined;
	let _desc: ChainableComparator<T> | undefined;
	const added: (string | symbol)[] = [ "nullsFirst", "nullsLast", "desc" ];
	return new Proxy<ChainableComparator<T>>(comparator as ChainableComparator<T>, {
		get(target: ChainableComparator<T>, p: string | symbol): unknown {
			if (p === "nullsFirst") {
				_nullsFirst ??= chainableComparator(withNullsFirst(comparator));
				return _nullsFirst;
			}
			if (p === "nullsLast") {
				_nullsLast ??= chainableComparator(withNullsLast(comparator));
				return _nullsLast;
			}
			if (p === "desc") {
				_desc ??= chainableComparator(withDesc(comparator));
				return _desc;
			}
			return target[ p as keyof ChainableComparator<T> ];
		},
		getOwnPropertyDescriptor(target: ChainableComparator<T>, p: string | symbol): PropertyDescriptor | undefined {
			if (added.includes(p)) {
				return {
					enumerable: true,
					get: () => target[ p as keyof ChainableComparator<T> ],
				};
			}
			return Object.getOwnPropertyDescriptor(target, p);
		},
		has<T>(target: ChainableComparator<T>, p: string | symbol): boolean {
			return added.includes(p) || Object.hasOwn(target, p);
		},
		ownKeys(target: ChainableComparator<T>): ArrayLike<string | symbol> {
			return [ ...added, ...Object.keys(target) ];
		},
	});
};

/**
 * Numeric comparator which sorts lower values before higher ones.
 */
export const numberAsc: Comparator<number> = (a, b) => a - b;

/**
 * Build a comparator for the given type, which goes through the
 * specified checks in the order they are defined.
 */
export type ComparatorBuilder<T> = {
	/**
	 * Return the generated comparator.
	 */
	build(): Comparator<T>;
	/**
	 * Invert the previous comparator.
	 */
	get desc(): ComparatorBuilder<T>;
	/**
	 * Have the previous comparator return null and undefined values before others.
	 */
	get nullsFirst(): ComparatorBuilder<T>;
	/**
	 * Have the previous comparator return null and undefined values after others.
	 */
	get nullsLast(): ComparatorBuilder<T>;
	/**
	 * Add comparator which first accesses a numeric value, often
	 * a property value, from the compared type.
	 */
	num(accessor: (t: T) => (undefined | number)): ComparatorBuilder<T>;
	/**
	 * Add comparator which first accesses a string value, often
	 * a property value, from the compared type.
	 */
	str(accessor: (t: T) => (undefined | string)): ComparatorBuilder<T>;
}

/**
 * Start building a comparator.
 */
export const comparatorBuilder = <T>(): ComparatorBuilder<T> => {
	const ops: [ (t: T) => unknown, Comparator<unknown> ][] = [];
	const withPrevious = (modifier: (comparator: Comparator<unknown>) => Comparator<unknown>): void => {
		const lastIndex = ops.length - 1;
		const comparator = ops[ lastIndex ][ 1 ];
		assertDefined(comparator, "Prior comparator");
		ops[ lastIndex ][ 1 ] = modifier(comparator);
	};
	const builder: ComparatorBuilder<T> = {
		build(): Comparator<T> {
			return (a: T, b: T): number => {
				for (const [ accessor, comparator ] of ops) {
					const aValue = accessor(a);
					const bValue = accessor(b);
					const result = comparator(aValue, bValue);
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			};
		},
		get desc(): ComparatorBuilder<T> {
			withPrevious((c) => withDesc(c));
			return builder;
		},
		get nullsFirst(): ComparatorBuilder<T> {
			withPrevious((c) => withNullsFirst(c));
			return builder;
		},
		get nullsLast(): ComparatorBuilder<T> {
			withPrevious((c) => withNullsLast(c));
			return builder;
		},
		num(accessor: (t: T) => (undefined | number)): ComparatorBuilder<T> {
			ops.push([ accessor, (a, b) => {
				if (a == null && b == null) {
					return 0;
				}
				if (a == null) {
					return 1;
				}
				if (b == null) {
					return -1;
				}
				return (a as number) - (b as number);
			} ]);
			return builder;
		},
		str(accessor: (t: T) => (undefined | string)): ComparatorBuilder<T> {
			ops.push([ accessor, (a, b) => {
				if (a == null && b == null) {
					return 0;
				}
				if (a == null) {
					return 1;
				}
				if (b == null) {
					return -1;
				}
				return (a as string).localeCompare(b as string);
			} ]);
			return builder;
		},
	};
	return builder;
};
