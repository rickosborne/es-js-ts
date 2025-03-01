import type { ResolvablePromise } from "./resolvable.js";
import { resolvablePromise } from "./resolvable.js";

/**
 * Wrapper for an {@link AsyncIterator} which allows multiple consumers
 * to read from the same iterable via a basic queue which tracks which
 * consumers have read which values.
 */
export class MultiAsyncIterator<T> implements AsyncIterable<T> {
	private readonly iteratorIds = new Set<number>();
	private lastIteratorId: number = 0;
	private readonly queue: ({ unread: Set<number>; value: T })[] = [];
	private sourceDone = false;
	private thrown: unknown = undefined;
	private readonly upstream: () => Promise<IteratorResult<T, undefined>>;
	private readonly waiting = new Map<number, ResolvablePromise<IteratorResult<T>>>();

	public constructor(upstream: (() => Promise<IteratorResult<T, undefined>>) | AsyncIterator<T, undefined>) {
		this.upstream = typeof upstream === "function" ? upstream : () => upstream.next();
	}

	public [ Symbol.asyncIterator ](): AsyncIterator<T, undefined, undefined> {
		const iteratorId = ++this.lastIteratorId;
		this.iteratorIds.add(iteratorId);
		const waiting = this.waiting;
		const queue = this.queue;
		const isDone = () => this.sourceDone;
		const notifyWaiting = () => this.onWaiting();
		const alreadyThrown = (): unknown => this.thrown;
		return {
			async next(): Promise<IteratorResult<T>> {
				const thrown = alreadyThrown();
				if (thrown !== undefined) {
					return { done: true, value: undefined };
				}
				const existingPromise = waiting.get(iteratorId);
				if (existingPromise != null) {
					throw new Error(`[MultiAsyncIterator#subscribe@${ iteratorId }#next] existing promise`);
				}
				const nextTokenAt = queue.findIndex((t) => t.unread.has(iteratorId));
				if (nextTokenAt >= 0) {
					const nextToken = queue[ nextTokenAt ]!;
					nextToken.unread.delete(iteratorId);
					if (nextToken.unread.size === 0) {
						queue.splice(nextTokenAt, 1);
					}
					return { done: false, value: nextToken.value };
				}
				if (isDone()) {
					return { done: true, value: undefined };
				}
				const resolvable = resolvablePromise<IteratorResult<T>>();
				waiting.set(iteratorId, resolvable);
				setTimeout(notifyWaiting, 1);
				return resolvable.promise;
			},
		};
	}

	public done(): void {
		this.sourceDone = true;
		const waiting = Array.from(this.waiting.values());
		this.waiting.clear();
		for (const { resolve } of waiting) {
			resolve({ done: true, value: undefined });
		}
	}

	public onThrow(reason: unknown): IteratorResult<T, undefined> {
		this.thrown = reason;
		this.sourceDone = true;
		const waiting = Array.from(this.waiting.values());
		this.waiting.clear();
		for (const { reject } of waiting) {
			reject(reason);
		}
		return { done: true, value: undefined };
	}

	private onValue(value: T): void {
		const unread = new Set<number>(this.iteratorIds);
		const waiting = Array.from(this.waiting.entries());
		this.waiting.clear();
		for (const [ iteratorId, { resolve } ] of waiting) {
			unread.delete(iteratorId);
			resolve({ done: false, value });
		}
		if (unread.size > 0) {
			this.queue.push({ unread, value });
		}
	}

	private onWaiting(): void {
		this.upstream()
			.then((result) => {
				if (result.done) {
					this.done();
				} else {
					this.onValue(result.value);
				}
			})
			.catch((err: unknown) => {
				this.onThrow(err);
			});
	}
}
