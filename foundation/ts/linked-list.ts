export type ListWalkDecision<T> = {
	deleteItem?: boolean;
	insertAfter?: T;
	insertBefore?: T;
	keepWalking: boolean;
};

export type List<T> = {
	at(index: number): T | undefined;
	get head(): T | undefined;
	insertAt(index: number, value: T): void;
	get isEmpty(): boolean;
	get length(): number;
	pop(): T | undefined;
	push(value: T): void;
	shift(): T | undefined;
	toArray(): T[];
	unshift(value: T): void;
	values(): Generator<T, void, undefined>;
	valuesAndIndexes(): Generator<[ T, number ], void, undefined>;
	walk(block: (value: T, index: number) => ListWalkDecision<T>): void;
	readonly [Symbol.toStringTag]: string;
}

type LinkNode<T> = {
	next?: LinkNode<T> | undefined;
	prev?: LinkNode<T> | undefined;
	value: T;
};

type LinksAround<T> = [prev: LinkNode<T> | undefined, current: LinkNode<T> | undefined, next: LinkNode<T> | undefined];
type LinkWindow<T> = [prev: LinkNode<T> | undefined, current: LinkNode<T>, next: LinkNode<T> | undefined, index: number];

abstract class ALinkedList<T> implements List<T> {
	protected count = 0;

	public abstract get [Symbol.toStringTag](): string;

	protected _head: LinkNode<T> | undefined = undefined;

	public get head(): T | undefined {
		return this._head?.value;
	}

	public insertAt(index: number, value: T): void {
		const [ prev, next ] = this.around(index);
		const node = this.buildNode(prev, value, next);
		this.relink(prev, node, next);
		this.count++;
	}

	protected around(index: number): LinksAround<T> {
		if (index < -1) {
			return [ undefined, undefined, undefined ];
		}
		if (index === -1) {
			return [ undefined, undefined, this._head ];
		}
		if (index === 0) {
			return [ undefined, this._head, this._head?.next ];
		}
		if (index === this.count - 1) {
			return [ ...this.last2Nodes(), undefined ];
		}
		if (index === this.count) {
			return [ this.last2Nodes()[1], undefined, undefined ];
		}
		if (index > this.count) {
			return [ undefined, undefined, undefined ];
		}
		let i = 0;
		let current = this._head;
		let prev: LinkNode<T> | undefined = undefined;
		while (i < index && current != null) {
			i++;
			prev = current;
			current = current.next;
		}
		return [ prev, current, current?.next ];

	}

	public get isEmpty(): boolean {
		return this.count === 0;
	}

	public get length(): number {
		return this.count;
	}

	public at(index: number): T | undefined {
		return this.around(index)[1]?.value;
	}

	protected abstract buildNode(prev: LinkNode<T> | undefined, value: T, next: LinkNode<T> | undefined): LinkNode<T>;

	protected abstract last2Nodes(): [ LinkNode<T> | undefined, LinkNode<T> | undefined ];

	public pop(): T | undefined {
		if (this.count === 0) {
			return undefined;
		}
		const [ penultimate, last ] = this.last2Nodes();
		this.relink(penultimate, undefined, undefined);
		this.count--;
		return last?.value;
	}

	public push(value: T): void {
		const [ , last ] = this.last2Nodes();
		const node = this.buildNode(last, value, undefined);
		this.relink(last, node, undefined);
		this.count++;
	}

	protected abstract relink(
		prev: LinkNode<T> | undefined,
		node: LinkNode<T> | undefined,
		next: LinkNode<T> | undefined,
	): void;

	public shift(): T | undefined {
		if (this._head == null) {
			return undefined;
		}
		const value = this._head.value;
		this.relink(undefined, undefined, this._head.next);
		this.count--;
		return value;
	}

	public toArray(): T[] {
		return Array.from(this.values());
	}

	public unshift(value: T): void {
		const node = this.buildNode(undefined, value, this._head);
		this.relink(undefined, node, this._head);
		this.count++;
	}

	public* values(): Generator<T, void, undefined> {
		let current = this._head;
		while (current != null) {
			yield current.value;
			current = current.next;
		}
	}

	public* valuesAndIndexes(): Generator<[ T, number ], void, undefined> {
		let current = this._head;
		let index = 0;
		while (current != null) {
			yield [ current.value, index ];
			current = current.next;
			index++;
		}
	}

	protected *windows(): Generator<LinkWindow<T>, undefined, void> {
		let current = this._head;
		let index = 0;
		let prev: LinkNode<T> | undefined = undefined;
		while (current != null) {
			const next = current.next;
			yield [ prev, current, next, index ];
			prev = current;
			current = next;
			index++;
		}
	}

	protected walkValues(
		decide: (value: T, index: number) => ListWalkDecision<T>,
		windows: Generator<LinkWindow<T>, undefined, void> = this.windows(),
	): void {
		let adjustedPrev: LinkNode<T> | undefined = undefined;
		for (const [ prev, current, next, index ] of windows) {
			const decision = decide(current.value, index);
			if (decision.deleteItem) {
				this.relink(adjustedPrev ?? prev, undefined, next);
				this.count--;
			}
			if (decision.insertBefore != null) {
				const inserted = this.buildNode(adjustedPrev ?? prev, decision.insertBefore, current);
				this.relink(adjustedPrev ?? prev, inserted, current);
				this.count++;
			}
			if (decision.insertAfter != null) {
				const inserted = this.buildNode(current, decision.insertAfter, next);
				this.relink(current, inserted, next);
				this.count++;
				adjustedPrev = inserted;
			} else {
				adjustedPrev = undefined;
			}
			if (!decision.keepWalking) {
				break;
			}
		}
	}

	public walk(decide: (value: T, index: number) => ListWalkDecision<T>): void {
		this.walkValues(decide);
	}
}

class SingleLinkedListImpl<T> extends ALinkedList<T> {
	public get [Symbol.toStringTag](): string {
		return `SingleLinkedList+${ this.count }`;
	}

	protected buildNode(_prev: LinkNode<T> | undefined, value: T, next: LinkNode<T> | undefined): LinkNode<T> {
		return { next, value };
	}

	protected last2Nodes(): [ LinkNode<T> | undefined, LinkNode<T> | undefined ] {
		let last = this._head;
		if (last == null) {
			return [ undefined, undefined ];
		}
		let penultimate: LinkNode<T> | undefined = undefined;
		while (last.next != null) {
			penultimate = last;
			last = last.next;
		}
		return [ penultimate, last ];
	}

	protected relink(prev: LinkNode<T> | undefined, node: LinkNode<T> | undefined, next: LinkNode<T> | undefined): void {
		if (prev == null) {
			this._head = node ?? next;
		} else {
			prev.next = node ?? next;
		}
	}
}

export const singleLinkedList = <T>(): List<T> => {
	return new SingleLinkedListImpl();
};

export type DoubleLinkedList<T> = List<T> & {
	get tail(): T | undefined;
	reverseValues(): Generator<T, void, undefined>;
	reverseValuesAndIndexes(): Generator<[ T, number ], void, undefined>;
	reverseWalk(block: (value: T, index: number) => ListWalkDecision<T>): void;
}

class DoubleLinkedListImpl<T> extends SingleLinkedListImpl<T> implements DoubleLinkedList<T> {
	public override get [Symbol.toStringTag](): string {
		return `DoubleLinkedList+${ this.count }`;
	}

	protected _tail: LinkNode<T> | undefined = undefined;

	public get tail(): T | undefined {
		return this._tail?.value;
	}

	protected reverseIndex(index: number): number {
		return this.count - index - 1;
	}

	protected override around(index: number): [ LinkNode<T> | undefined, LinkNode<T> | undefined, LinkNode<T> | undefined ] {
		const reverseIndex = this.reverseIndex(index);
		if (reverseIndex >= index) {
			return super.around(index);
		}
		let i = 0;
		let current = this._tail;
		while (i < reverseIndex && current != null) {
			i++;
			current = current.prev;
		}
		return [ current?.prev, current, current?.next ];
	}

	protected override buildNode(prev: LinkNode<T> | undefined, value: T, next: LinkNode<T> | undefined): LinkNode<T> {
		return { next, prev, value };
	}

	protected override last2Nodes(): [ LinkNode<T> | undefined, LinkNode<T> | undefined ] {
		return [ this._tail?.prev, this._tail ];
	}

	protected override relink(prev: LinkNode<T> | undefined, node: LinkNode<T> | undefined, next: LinkNode<T> | undefined): void {
		super.relink(prev, node, next);
		if (next == null) {
			this._tail = node ?? prev;
		} else {
			next.prev = node ?? prev;
		}
	}

	public *reverseValues(): Generator<T, void, undefined> {
		let current = this._tail;
		while (current != null) {
			yield current.value;
			current = current.prev;
		}
	}

	public *reverseValuesAndIndexes(): Generator<[ T, number ], void, undefined> {
		let current = this._tail;
		let index = this.count - 1;
		while (current != null) {
			yield [ current.value, index ];
			current = current.prev;
			index--;
		}
	}

	public reverseWalk(block: (value: T, index: number) => ListWalkDecision<T>): void {
		this.walkValues(block, this.reverseWindows());
	}

	protected *reverseWindows(): Generator<LinkWindow<T>, undefined, void> {
		let current = this._tail;
		let index = this.count - 1;
		while (current != null) {
			const prev = current.prev;
			yield [ prev, current, current.next, index ];
			current = prev;
			index--;
		}
	}

}

export const doubleLinkedList = <T>(): DoubleLinkedList<T> => {
	return new DoubleLinkedListImpl();
};
