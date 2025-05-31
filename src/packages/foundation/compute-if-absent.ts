/**
 * Find the item in the Map, or compute and store it.
 */
export const computeIfAbsent = <T, K>(
	key: K,
	map: Map<K, T>,
	compute: (k: K) => T,
): T => {
	let item: T | undefined = map.get(key);
	if (item == null) {
		item = compute(key);
		map.set(key, item);
	}
	return item;
};
