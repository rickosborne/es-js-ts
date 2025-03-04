import { MultiAsyncIterator } from "./multi-async-iterator.js";
import { AsyncStringTokenizer } from "./string-tokenizer.js";

export abstract class TokenGenerator<TokenT> extends AsyncStringTokenizer implements AsyncIterable<TokenT> {
	protected readonly multiIterator: MultiAsyncIterator<TokenT>;
	private readonly tokenQueue: TokenT[] = [];

	protected constructor(iterator: AsyncIterator<string, undefined, undefined>, text?: string, at = 0) {
		super(iterator, text, at);
		this.multiIterator = new MultiAsyncIterator((): Promise<IteratorResult<TokenT, undefined>> => {
			if (this.tokenQueue.length > 0) {
				const value = this.tokenQueue.shift()!;
				return Promise.resolve({ done: false, value });
			}
			return this.onWaiting();
		});
	}

	protected onDone(): void {
		this.multiIterator.done();
	}

	protected onToken(value: TokenT): void {
		this.tokenQueue.push(value);
	}

	protected abstract onWaiting(): Promise<IteratorResult<TokenT, undefined>>;

	public [ Symbol.asyncIterator ](): AsyncIterator<TokenT, undefined, undefined> {
		return this.multiIterator[ Symbol.asyncIterator ]();
	}
}
