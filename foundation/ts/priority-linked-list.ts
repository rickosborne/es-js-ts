import type { Queue } from "./queue.js";
import { singleLinkedList } from "./linked-list.js";
import type { Comparator } from "@rickosborne/typical";

export class PriorityLinkedList<T> implements Queue<T> {
	private readonly list = singleLinkedList<T>();

	constructor(private readonly comparator: Comparator<T>) {
	}

	public add(item: T): void {
		if (this.list.isEmpty) {
			this.list.unshift(item);
		} else {
			const lastIndex = this.list.length - 1;
			this.list.walk((other, index) => {
				const comparison = this.comparator(item, other);
				if (other === item) {
					return { keepWalking: false };
				}
				if (comparison < 0) {
					return { insertBefore: item, keepWalking: false };
				}
				if (index === lastIndex) {
					return { insertAfter: item, keepWalking: false };
				}
				return { keepWalking: true };
			});
		}
	}

	public get length(): number {
		return this.list.length;
	}

	public peek(): T | undefined {
		return this.list.head;
	}

	public remove(item: T): void {
		this.list.walk((other) => {
			const comparison = this.comparator(item, other);
			if (comparison === 0) {
				return { deleteItem: true, keepWalking: true };
			}
			if (comparison < 0) {
				return { keepWalking: false };
			}
			return { keepWalking: true };
		});
	}

	public take(): T | undefined {
		return this.list.shift();
	}

	public toArray(): T[] {
		return this.list.toArray();
	}

	public values(): Generator<T, void, undefined> {
		return this.list.values();
	}
}
