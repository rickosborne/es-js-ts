/**
 * A Map-like structure with several handy utility methods.
 */
export interface BetterMapLike<K, V> {
	/**
	 * Remove all entries.
	 */
	clear(): void;

	/**
	 * Copy all entries into a duplicate structure.  If the `valueDuplicator`
	 * is present, it will be called for each value to provide an
	 * alternative (presumably deep copied) value for the given key.
	 * Otherwise, values are copied by reference.
	 */
	copy(valueDuplicator?: ((value: V, key: K) => V) | undefined): BetterMapLike<K, V>;

	/**
	 * Delete the entry identified by the given key.
	 */
	delete(key: K): boolean;

	/**
	 * Get an array of entry pairs.
	 */
	entries(): [K, V][];

	/**
	 * Get an iterator for entry pairs.  These are not in any particular order.
	 */
	entryIterator(): Iterator<[K, V], BuiltinIteratorReturn, unknown>

	/**
	 * Find the value identified by the given key, or `undefined` if not present.
	 */
	get(key: K): V | undefined;

	/**
	 * Find the value identified by the given key, or compute it via the
	 * given function if not present and store it.
	 */
	getOrCompute(key: K, supplier: (k: K) => V): V;

	/**
	 * Whether there is an entry present identified by the given key.
	 */
	has(key: K): boolean;

	/**
	 * Get an iterator for stores keys.  These are not in any particular order.
	 */
	keyIterator(): MapIterator<K>;

	/**
	 * Get an array of stored keys.  These are not in any particular order.
	 */
	keys(): K[];

	/**
	 * If an entry is present for the given key, and the existing value
	 * matches the given predicate, replace it with the new value.
	 * Otherwise, do not modify the entry.
	 */
	replaceIf(key: K, value: V, predicate: (existingValue: V, existingKey: K) => boolean): boolean;

	/**
	 * If an entry is present for the given key, replace it with the
	 * given value.
	 */
	replaceIfPresent(key: K, value: V): boolean;

	/**
	 * Create or update an entry for the given key to the given value.
	 */
	set(key: K, value: V): void;

	/**
	 * Create or update entries for the given pairs of keys and values.
	 */
	setEach(iterable: Iterable<Readonly<[K, V]>>): void;

	/**
	 * Create entries for the given pairs of keys and values, only if
	 * no entry is already present for that key.
	 */
	setEachIfAbsent(iterable: Iterable<Readonly<[K, V]>>): void;

	/**
	 * Create an entry for the given key with the given value, only
	 * if an entry is not already present for that key.
	 */
	setIfAbsent(key: K, value: V): V;

	/**
	 * Copy all entries into a new Map.  If the `valueDuplicator` is
	 * present, it will be called for each value to provide an
	 * alternative (presumably deep copied) value for the given key.
	 * Otherwise, values are copied by reference.
	 */
	toMap(valueDuplicator?: ((value: V, key: K) => V) | undefined): Map<K, V>;

	/**
	 * Get the current number of entries.
	 */
	get size(): number;

	/**
	 * Set the value of an entry, receiving a callback with the existing
	 * value, or undefined if not present.
	 */
	upsert(key: K, combine: (maybeValue: V | undefined) => V): void;

	/**
	 * Get an iterator for the values, in no specific order.
	 */
	valueIterator(): Iterator<V, BuiltinIteratorReturn, unknown>;

	/**
	 * Get an array of the values, in no specific order.
	 */
	values(): V[];
}
