import type { BetterMapLike } from "./better-map-like.js";

export class BetterMap<K, V> implements BetterMapLike<K, V> {
	public static empty<Key, Value>(): BetterMap<Key, Value> {
		return new BetterMap<Key, Value>();
	}

	public static from<Key, Value>(source: Iterable<readonly [ Key, Value ]>): BetterMap<Key, Value> {
		const map = new Map<Key, [ Value ]>();
		for (const [ k, v ] of source) {
			map.set(k, [ v ]);
		}
		return new BetterMap<Key, Value>(map);
	}

	private readonly map: Map<K, [ V ]>;

	protected constructor(map = new Map<K, [ V ]>()) {
		this.map = map;
	}

	public clear(): void {
		this.map.clear();
	}

	public copy(valueDuplicator?: ((value: V, key: K) => V) | undefined): BetterMap<K, V> {
		const dupe: ((value: V, key: K) => V) = valueDuplicator ?? ((v) => v);
		const map = new Map<K, [ V ]>();
		for (const [ k, [ v ] ] of this.map.entries()) {
			map.set(k, [ dupe(v, k) ]);
		}
		return new BetterMap(map);
	}

	public delete(key: K): boolean {
		return this.map.delete(key);
	}

	public entries(): [ K, V ][] {
		return Array.from(this.map.entries()).map(([ k, [ v ] ]) => [ k, v ]);
	}

	public *entryIterator(): Generator<[ K, V ], undefined, undefined> {
		for (const [ k, [ v ] ] of this.map.entries()) {
			yield [ k, v ];
		}
	}

	public get(key: K): V | undefined {
		return this.map.get(key)?.[ 0 ];
	}

	public getOrCompute(key: K, supplier: (k: K) => V): V {
		const held = this.map.get(key);
		if (held != null) {
			return held[ 0 ];
		}
		const value = supplier(key);
		this.map.set(key, [ value ]);
		return value;
	}

	public has(key: K): boolean {
		return this.map.has(key);
	}

	public keyIterator(): MapIterator<K> {
		return this.map.keys();
	}

	public keys(): K[] {
		return Array.from(this.map.keys());
	}

	public replaceIf(key: K, value: V, predicate: (existingValue: V, existingKey: K) => boolean): boolean {
		const held = this.map.get(key);
		if (held == null) {
			return false;
		}
		if (predicate(held[ 0 ], key)) {
			held[ 0 ] = value;
			return true;
		}
		return false;
	}

	public replaceIfPresent(key: K, value: V): boolean {
		const held = this.map.get(key);
		if (held == null) {
			return false;
		}
		this.map.set(key, [ value ]);
		return true;
	}

	public set(key: K, value: V): void {
		this.map.set(key, [ value ]);
	}

	public setEach(iterable: Iterable<Readonly<[ K, V ]>>): void {
		for (const [ k, v ] of iterable) {
			this.map.set(k, [ v ]);
		}
	}

	public setEachIfAbsent(iterable: Iterable<Readonly<[ K, V ]>>): void {
		for (const [ k, v ] of iterable) {
			this.setIfAbsent(k, v);
		}
	}

	public setIfAbsent(key: K, value: V): V {
		const held = this.map.get(key);
		if (held == null) {
			this.map.set(key, [ value ]);
			return value;
		}
		return held[ 0 ];
	}

	public get size(): number {
		return this.map.size;
	}

	public toMap(valueDuplicator?: ((value: V, key: K) => V) | undefined): Map<K, V> {
		const dupe: ((value: V, key: K) => V) = valueDuplicator ?? ((v) => v);
		const map = new Map<K, V>();
		for (const [ k, [ v ] ] of this.map.entries()) {
			map.set(k, dupe(v, k));
		}
		return map;
	}

	public upsert(key: K, combine: (maybeValue: (V | undefined)) => V): void {
		const held = this.map.get(key);
		const value = combine(held?.[0]);
		this.map.set(key, [ value ]);
	}

	public *valueIterator(): Generator<V, undefined, undefined> {
		for (const [ v ] of this.map.values()) {
			yield v;
		}
	}

	public values(): V[] {
		return Array.from(this.map.values()).map(([ v ]) => v);
	}
}
