import { isPlainObject } from "@rickosborne/guard";
import type { Comparator } from "@rickosborne/typical";
import { arrayEq } from "./array-eq.js";
import { ecmaKeySort } from "./ecma-key-sort.js";

export interface DeepSortOptions {
	keySorting?: "ecma" | "text" | Comparator<string | symbol>;
}

/**
 * Sort an object, and any objects nested through plain objects
 * or arrays, by key, so when JSON stringified you will get a
 * deterministic output.
 */
export const deepSort = <T>(
	obj: T,
	options: DeepSortOptions = {},
): T => {
	const keySorting = options.keySorting ?? "text";
	const keyComparator: Comparator<string | symbol> = typeof keySorting === "function" ? keySorting : keySorting === "ecma" ? (a, b) => ecmaKeySort(String(a), String(b)) : (a, b) => String(a).localeCompare(String(b));
	const sorted = new Map<unknown, unknown>();
	const sort = <U>(o: U): U => {
		if (o == null || typeof o !== "object") {
			return o;
		}
		const seen = sorted.get(o);
		if (seen != null) {
			return seen as U;
		}
		if (Array.isArray(o)) {
			const a = [] as U & unknown[];
			sorted.set(o, a);
			o.forEach((item, index) => {
				a[ index ] = sort(item);
			});
			return a;
		}
		if (!isPlainObject(o)) {
			return o;
		}
		const out = {} as U & object;
		sorted.set(o, out);
		const originalKeys = Object.keys(o);
		const sortedKeys = originalKeys.slice()
			.sort(keyComparator) as (string & keyof U)[];
		for (const key of sortedKeys) {
			out[ key ] = sort(o[ key ]);
		}
		if (arrayEq(originalKeys, sortedKeys)) {
			return out;
		}
		// Otherwise, return a proxy which will keep the keys
		// in the preferred order.
		return new Proxy<U & object>(out, {
			ownKeys(): ArrayLike<string | symbol> {
				return sortedKeys;
			},
		});
	};
	return sort(obj);
};
