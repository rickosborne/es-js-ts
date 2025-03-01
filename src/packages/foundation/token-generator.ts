import { AsyncStringTokenizer } from "./index.js";
import { MultiAsyncIterator } from "./multi-async-iterator.js";
import { resolvablePromise, type ResolvablePromise } from "./resolvable.js";

export abstract class TokenGenerator<TokenT> extends AsyncStringTokenizer implements AsyncIterable<TokenT> {
	protected readonly multiIterator: MultiAsyncIterator<TokenT>;
	private readonly tokenQueue: TokenT[] = [];
	private waiting: ResolvablePromise<IteratorResult<TokenT, undefined>> | undefined;

	protected constructor(iterator: AsyncIterator<string, undefined, undefined>, text?: string, at = 0) {
		super(iterator, text, at);
		this.multiIterator = new MultiAsyncIterator(async (): Promise<IteratorResult<TokenT, undefined>> => {
			if (this.tokenQueue.length > 0) {
				const value = this.tokenQueue.shift()!;
				return { done: false, value };
			}
			if (this.waiting == null) {
				const resolvable = resolvablePromise<IteratorResult<TokenT, undefined>>();
				this.waiting = resolvable;
				setTimeout(() => this.onWaiting(), 1);
				return resolvable.promise;
			}
			return this.waiting;
		});
	}

	protected onDone(): void {
		this.multiIterator.done();
	}

	protected onToken(value: TokenT): void {
		this.tokenQueue.push(value);
		if (this.waiting != null) {
			const nextValue = this.tokenQueue.shift()!;
			const waiting = this.waiting;
			this.waiting = undefined;
			waiting.resolve({ done: false, value: nextValue });
		}
	}

	protected abstract onWaiting(): void;

	public [ Symbol.asyncIterator ](): AsyncIterator<TokenT, undefined, undefined> {
		return this.multiIterator[ Symbol.asyncIterator ]();
	}
}
