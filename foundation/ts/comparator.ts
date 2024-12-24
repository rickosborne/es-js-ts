import { Comparator } from "@rickosborne/typical";

export type ComparatorBuilder<T> = {
	build(): Comparator<T>;
	num(accessor: (t: T) => (undefined | number)): ComparatorBuilder<T>;
	str(accessor: (t: T) => (undefined | string)): ComparatorBuilder<T>;
}

export const comparatorBuilder = <T>(): ComparatorBuilder<T> => {
	const comparators: Comparator<T>[] = [];
	const builder: ComparatorBuilder<T> = {
		build(): Comparator<T> {
			return (a: T, b: T): number => {
				for (const comparator of comparators) {
					const result = comparator(a, b);
					if (result !== 0) {
						return result;
					}
				}
				return 0;
			};
		},
		num(accessor: (t: T) => (undefined | number)): ComparatorBuilder<T> {
			comparators.push((a, b) => {
				const aValue = accessor(a);
				const bValue = accessor(b);
				if (bValue === undefined && aValue === undefined) {
					return 0;
				}
				if (bValue === undefined) {
					return -1;
				}
				if (aValue === undefined) {
					return 1;
				}
				return aValue - bValue;
			});
			return builder;
		},
		str(accessor: (t: T) => (undefined | string)): ComparatorBuilder<T> {
			comparators.push((a, b) => {
				const aValue = accessor(a);
				const bValue = accessor(b);
				if (bValue === undefined && aValue === undefined) {
					return 0;
				}
				if (bValue === undefined) {
					return -1;
				}
				if (aValue === undefined) {
					return 1;
				}
				return aValue.localeCompare(bValue);
			});
			return builder;
		},
	};
	return builder;
};
