import type { BetterMapLike } from "./better-map-like.js";

/**
 * A Map structure which has a tuple key.
 */
export class TupleMap<K extends unknown[], V> implements BetterMapLike<K, V> {
	/**
	 * Create a map which uses tuples of the specified length for keys.
	 */
	public static forKeyLength<KeyT extends unknown[] & { length: N }, ValueT, N extends number>(keyLength: N): TupleMap<KeyT, ValueT> {
		return new TupleMap<KeyT, ValueT>(keyLength);
	}

	/**
	 * Create a map from the given tuple length and iterable initial entries.
	 */
	public static from<KeyT extends unknown[] & { length: N }, ValueT, N extends number>(keyLength: N, entries: Iterable<readonly [ KeyT, ValueT ]>): TupleMap<KeyT, ValueT> {
		const map = new TupleMap<KeyT, ValueT>(keyLength);
		map.setEach(entries);
		return map;
	}

	private readonly _keyLength: number;
	private _size = 0;
	private readonly root = new Map<unknown, unknown>;
	private readonly tailIndex: number;

	protected constructor(keyLength: number) {
		if (keyLength < 2 || !Number.isSafeInteger(keyLength)) {
			throw new RangeError("MultiKeyMap keyLength must be an integer of at least 2");
		}
		this._keyLength = keyLength;
		this.tailIndex = keyLength - 1;
	}

	public clear(): void {
		this.root.clear();
		this._size = 0;
	}

	public copy(valueDuplicator: ((value: V, key: K) => V) | undefined = ((v) => v)): TupleMap<K, V> {
		const map = new TupleMap<K, V>(this.keyLength);
		for (const [ k, originalV ] of this.entries()) {
			const v = valueDuplicator(originalV, k);
			map.set(k, v);
		}
		return map;
	}

	public delete(key: K): boolean {
		const { held, map, tail } = this.find(key);
		if (held == null) {
			return false;
		}
		map.delete(tail);
		this._size--;
		return true;
	}

	public entries(): [ K, V ][] {
		return Array.from(this.entryIterator());
	}

	public* entryIterator(): Generator<[ K, V ], undefined, undefined> {
		const maps: Map<unknown, unknown>[] = [ this.root ];
		let iterators: MapIterator<unknown>[] = [ this.root.entries() ];
		const keyParts: unknown[] = [];
		const { tailIndex } = this;
		while (iterators.length > 0) {
			const lastIt = iterators[ iterators.length - 1 ]!;
			const itResult = lastIt.next();
			if (itResult.done) {
				iterators.pop();
				keyParts.pop();
				maps.pop();
				continue;
			}
			const [ keyPart, value ] = itResult.value as [ unknown, unknown ];
			if (keyParts.length === tailIndex) {
				yield [ keyParts.concat(keyPart) as K, (value as [ V ])[ 0 ] ];
			} else if (value instanceof Map) {
				if (value.size === 0) {
					// Garbage collect the empty Map
					const lastMap = maps[maps.length - 1];
					if (lastMap != null) {
						lastMap.delete(keyPart);
					}
				} else {
					maps.push(value);
					iterators.push(value.entries());
					keyParts.push(keyPart);
				}
			}
		}
	}

	private find(key: K): { held: [ V ] | undefined; map: Map<unknown, [ V ]>; maps: Map<unknown, unknown>[]; tail: unknown } {
		const { map, maps } = this.mapsForKey(key);
		const tail = this.keyTail(key);
		const held = map.get(tail);
		return { held, map, maps, tail };
	}

	public get(key: K): V | undefined {
		const { held } = this.find(key);
		return held?.[ 0 ];
	}

	public getOrCompute(key: K, supplier: (k: K) => V): V {
		const { held, map, tail } = this.find(key);
		if (held == null) {
			const value = supplier(key);
			map.set(tail, [ value ]);
			this._size++;
			return value;
		}
		return held[ 0 ];
	}

	public has(key: K): boolean {
		const { held } = this.find(key);
		return held != null;
	}

	public* keyIterator(): Generator<K, undefined, undefined> {
		for (const [ k ] of this.entryIterator()) {
			yield k;
		}
	}

	public get keyLength(): number {
		return this._keyLength;
	}

	private keyTail(key: K): unknown {
		return key[ this.tailIndex ];
	}

	public keys(): K[] {
		return Array.from(this.keyIterator());
	}

	private mapsForKey(key: K): { map: Map<unknown, [ V ]>; maps: Map<unknown, unknown>[] } {
		const maps: Map<unknown, unknown>[] = [ this.root ];
		let map: Map<unknown, unknown> | undefined = this.root;
		for (let i = 0; i < this.tailIndex; i++) {
			const prev: Map<unknown, unknown> = map;
			const keyPart = key[ i ];
			map = prev.get(keyPart) as Map<unknown, unknown> | undefined;
			if (map == null) {
				map = new Map<unknown, unknown>();
				prev.set(keyPart, map);
			}
			maps.push(map);
		}
		return { map: map as Map<unknown, [ V ]>, maps };
	}

	public replaceIf(key: K, value: V, predicate: (existingValue: V, existingKey: K) => boolean): boolean {
		const { held, map, tail } = this.find(key);
		if (held != null) {
			if (predicate(held[ 0 ], key)) {
				map.set(tail, [ value ]);
				return true;
			}
		}
		return false;
	}

	public replaceIfPresent(key: K, value: V): boolean {
		const { held, map, tail } = this.find(key);
		if (held != null) {
			map.set(tail, [ value ]);
			return true;
		}
		return false;
	}

	public set(key: K, value: V): void {
		const { held, map, tail } = this.find(key);
		map.set(tail, [ value ]);
		if (held == null) {
			this._size++;
		}
	}

	public setEach(iterable: Iterable<Readonly<[ K, V ]>>): void {
		for (const [ k, v ] of iterable) {
			this.set(k, v);
		}
	}

	public setEachIfAbsent(iterable: Iterable<Readonly<[ K, V ]>>): void {
		for (const [ k, v ] of iterable) {
			this.setIfAbsent(k, v);
		}
	}

	public setIfAbsent(key: K, value: V): V {
		const { held, map, tail } = this.find(key);
		if (held == null) {
			map.set(tail, [ value ]);
			this._size++;
			return value;
		}
		return held[ 0 ];
	}

	public get size(): number {
		return this._size;
	}

	public toMap(valueDuplicator: ((value: V, key: K) => V) | undefined = ((v) => v)): Map<K, V> {
		return new Map<K, V>(this.entries().map(([ k, v ]) => [ k, valueDuplicator(v, k) ]));
	}

	public upsert(key: K, combine: (maybeValue: (V | undefined)) => V): void {
		const { held, map, tail } = this.find(key);
		const value = combine(held?.[0]);
		map.set(tail, [ value ]);
		if (held == null) {
			this._size++;
		}
	}

	public* valueIterator(): Generator<V, undefined, undefined> {
		for (const [ , v ] of this.entryIterator()) {
			yield v;
		}
	}

	public values(): V[] {
		return Array.from(this.valueIterator());
	}
}
