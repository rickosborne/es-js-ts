import type { Comparator } from "@rickosborne/typical";
import { binaryIndexOf } from "./binary-index-of.js";
import type { Queue } from "./queue.js";

/**
 * An implementation of a priority queue backed by a JS array,
 * using the given comparator.  Sorts low-to-high, so you will
 * need to invert comparator if you want high-to-low.
 */
export class PriorityArray<T> implements Queue<T> {
	private readonly items: T[] = [];

	constructor(private readonly comparator: Comparator<T>) {
	}

	public get [ Symbol.toStringTag ](): string {
		return `PriorityArray+${ this.items.length }`;
	}

	public get length(): number {
		return this.items.length;
	}

	public add(value: T): void {
		const { exists, before } = binaryIndexOf(value, this.items, this.comparator);
		if (exists) {
			return;
		}
		if (before === 0) {
			this.items.unshift(value);
		} else if (before === this.items.length) {
			this.items.push(value);
		} else {
			this.items.splice(before, 0, value);
		}
	}

	public peek(): T | undefined {
		return this.items[ 0 ];
	}

	public remove(item: T): void {
		for (let i = this.items.length - 1; i >= 0; i--) {
			const other: T = this.items[ i ];
			const comparison = this.comparator(item, other);
			if (comparison === 0) {
				this.items.splice(i, 1);
			} else if (comparison > 0) {
				break;
			}
		}
	}

	public take(): T | undefined {
		return this.items.shift();
	}

	public toArray(): T[] {
		return this.items.slice();
	}

	public* values(): Generator<T, void, undefined> {
		for (const item of this.items) {
			yield item;
		}
	}
}
