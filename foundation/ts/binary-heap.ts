import type { Queue } from "./queue.js";
import type { Comparator } from "@rickosborne/typical";

export class ArrayBinaryMinHeap<T> implements Queue<T> {
	private count: number = 0;
	private readonly items: T[] = [ null as T ];

	constructor(private readonly comparator: Comparator<T>) {
	}

	public get length(): number {
		return this.count;
	}

	public add(value: T): void {
		this.items.push(value);
		this.count++;
		this.up(this.count);
	}

	protected down(index: number): void {
		let i = index;
		let current: T = this.items[index];
		while ((i * 2) <= this.count) {
			const minChild = this.minChild(i * 2);
			const child: T = this.items[minChild];
			if (this.comparator(current, child) > 0) {
				this.items[i] = child;
				this.items[minChild] = current;
			}
			i = minChild;
			current = child;
		}
	}

	protected minChild(index: number): number {
		if (index + 1 > this.count) {
			return index;
		}
		if (this.comparator(this.items[index], this.items[index + 1]) < 0) {
			return index;
		}
		return index + 1;
	}

	public peek(): T | undefined {
		return this.items[1];
	}

	public remove(item: T): void {
		let removedAny: boolean;
		do {
			removedAny = false;
			for (const [ value, index ] of this.valuesAndIndexes()) {
				const compared = this.comparator(item, value);
				if (compared === 0) {
					// This invalidates the iterator
					this.removeAt(index);
					removedAny = true;
					break;
				}
				if (compared < 0) {
					break;
				}
			}
		} while (removedAny);
	}

	private removeAt(index: number): T {
		const value = this.items[index];
		const lastItem = this.items.pop() as T;
		this.count--;
		if (index <= this.count) {
			this.items[index] = lastItem;
			this.down(index);
		}
		return value;
	}

	public sort(): void {
		const values = Array<T>(this.count + 1);
		values[0] = null as T;
		let index = 1;
		let anyMoves = false;
		for (const [ value, originalIndex ] of this.valuesAndIndexes()) {
			values[index] = value;
			if (index !== originalIndex) {
				anyMoves = true;
			}
			index++;
		}
		if (anyMoves) {
			for (let i = 1; i <= this.count; i++) {
				this.items[i] = values[i];
			}
		}
	}

	public take(): T | undefined {
		if (this.count === 0) {
			return undefined;
		}
		return this.removeAt(1);
	}

	public toArray(): T[] {
		return Array.from(this.values());
	}

	protected up(index: number): void {
		let currentIndex = index;
		while (currentIndex >= 2) {
			const current: T = this.items[currentIndex];
			const parentIndex = currentIndex >> 1;
			const parent: T = this.items[parentIndex];
			const compared = this.comparator(current, parent);
			if (compared === 0) {
				this.removeAt(currentIndex);
			} else if (compared < 0) {
				this.items[parentIndex] = current;
				this.items[currentIndex] = parent;
			}
			currentIndex = parentIndex;
		}
	}

	public* values(): Generator<T, void, undefined> {
		for (const [ value ] of this.valuesAndIndexes()) {
			yield value;
		}
	}

	protected* valuesAndIndexes(): Generator<[ T, number ], void, undefined> {
		if (this.count < 1) {
			return;
		}
		const paths: number[] = [ 1 ];
		while (paths.length > 0) {
			let index = paths.shift()!;
			let value = this.items[index];
			const smaller = paths
				.map((itemIndex, pathIndex) => ({ itemIndex, otherValue: this.items[itemIndex], pathIndex }))
				.filter(({ otherValue }) => this.comparator(otherValue, value) < 0);
			if (smaller.length > 1) {
				paths.push(index);
			} else {
				if (smaller.length === 1) {
					paths[smaller[0].pathIndex] = index;
					index = smaller[0].itemIndex;
					value = smaller[0].otherValue;
				}
				yield [ value, index ];
				const child1Index = index * 2;
				const child2Index = child1Index + 1;
				if (child1Index <= this.count) {
					paths.push(child1Index);
				}
				if (child2Index <= this.count) {
					paths.push(child2Index);
				}
			}
		}
	}
}

export const arrayBinaryMinHeap = <T>(
	comparator: Comparator<T>,
) => new ArrayBinaryMinHeap<T>(comparator);

export const arrayBinaryMaxHeap = <T>(
	comparator: Comparator<T>,
) => new ArrayBinaryMinHeap<T>((a, b) => comparator(b, a));
