import type { Queue } from "./queue.js";
import type { Comparator } from "@rickosborne/typical";

type SkipNode<T> = {
	forward: (SkipNode<T> | undefined)[];
	value: T;
}

export class SkipList<T> implements Queue<T> {
	protected readonly root: SkipNode<T>;
	protected level: number = 0;
	protected count: number = 0;

	public constructor(
		protected readonly comparator: Comparator<T>,
		protected readonly maxLevel: number = 8,
		protected readonly random: () => number = () => Math.random(),
	) {
		this.root = this.buildNode(null as T, this.maxLevel);
	}

	private buildUpdate(value: T): {current: SkipNode<T> | undefined; update: (SkipNode<T> | undefined)[]} {
		const update = Array<SkipNode<T> | undefined>(this.maxLevel + 1);
		let current: SkipNode<T> | undefined = this.root;
		for (let i = this.level; i >= 0; i--) {
			let nextForward: SkipNode<T> | undefined = current?.forward[i];
			while (nextForward != null && this.comparator(nextForward.value, value) < 0) {
				current = nextForward;
				nextForward = nextForward.forward[i];
			}
			update[i] = current;
		}
		current = current?.forward[0];
		return { current, update };
	}

	public add(value: T): void {
		let { current, update } = this.buildUpdate(value);
		if (current == null || this.comparator(current.value, value) !== 0) {
			const level = this.randomLevel();
			if (level > this.level) {
				for (let i = this.level + 1; i <= level; i++) {
					update[i] = this.root;
				}
				this.level = level;
			}
			const node: SkipNode<T> = this.buildNode(value, level);
			for (let i = 0; i <= level; i++) {
				const toUpdate = update[i];
				if (toUpdate != null) {
					node.forward[i] = toUpdate.forward[i];
					toUpdate.forward[i] = node;
				}
			}
			this.count++;
		}
	}

	public remove(value: T): void {
		let { current, update } = this.buildUpdate(value);
		if (current != null && this.comparator(current.value, value) === 0) {
			for (let i = 0; i <= this.level; i++) {
				const toUpdate = update[i];
				if (toUpdate?.forward[i] !== current) {
					break;
				}
				if (toUpdate != null) {
					toUpdate.forward[i] = current.forward[i];
				}
			}
			while (this.level > 0 && this.root.forward[this.level] == null) {
				this.level--;
			}
			this.count--;
		}
	}

	public get length(): number {
		return this.count;
	}

	public peek(): T | undefined {
		return this.root.forward[0]?.value;
	}

	public take(): T | undefined {
		if (this.count === 0) {
			return undefined;
		}
		const headValue = this.peek() as T;
		this.remove(headValue);
		return headValue;
	}

	public toArray(): T[] {
		return Array.from(this.values());
	}

	public *values(): Generator<T, void, undefined> {
		for (const [ value ] of this.valuesAndIndexes()) {
			yield value;
		}
	}

	public* valuesAndIndexes(): Generator<[T, number], void, undefined> {
		let index = 0;
		let current: SkipNode<T> | undefined = this.root.forward[0];
		while (current != null) {
			yield [ current.value, index ];
			index++;
			current = current.forward[0];
		}
	}

	protected buildNode(value: T, level: number): SkipNode<T> {
		return { forward: Array<SkipNode<T>>(level + 1), value };
	}

	protected randomLevel(): number {
		return Math.trunc(this.random() * this.maxLevel + 1);
	}
}

export const skipList = <T>(
	comparator: Comparator<T>,
) => new SkipList<T>(comparator);