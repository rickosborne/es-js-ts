/**
 * Sort an object, and any objects nested through plain objects
 * or arrays, by key, so when JSON stringified you will get a
 * deterministic output.
 */
export const deepSort = <T>(obj: T): T => {
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
				a[index] = sort(item);
			});
			return a;
		}
		const out = {} as U & object;
		sorted.set(o, out);
		const keys = Object.keys(o)
			.sort((a, b) => a.localeCompare(b)) as (string & keyof U)[];
		for (const key of keys) {
			out[key] = sort(o[key]);
		}
		// This looks goofy, but ...
		// In modern versions of node, the default implementation
		// will try to numeric-sort keys for you.  Because we want
		// string string-sorting only, we have to proxy the call to
		// return the correct order.
		return new Proxy<U & object>(out, {
			ownKeys(): ArrayLike<string | symbol> {
				return keys;
			},
		});
	};
	return sort(obj);
};
