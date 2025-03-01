import { ValidationError } from "@rickosborne/guard";
import type { BiPredicate } from "@rickosborne/typical";
import { asyncIteratorFor } from "./iterator.js";

abstract class AStringTokenizer {
	protected _at: number;
	protected _text: string | undefined;
	protected readonly ahead: string[] = [];
	protected iteratorDone: boolean = false;

	protected constructor(text?: string | undefined, at = 0) {
		this._at = at;
		this._text = text;
	}

	protected assertPositiveInt(value: number): void {
		if (value < 0 || !Number.isSafeInteger(value)) {
			throw new RangeError("Value should be an integer >= 0");
		}
	}

	/**
	 * Get the location of the next character available to be consumed.
	 */
	public get at(): number {
		return this._at;
	}

	/**
	 * Whether all the text has already been tokenized.
	 */
	public get done(): boolean {
		return this.iteratorDone && this.ahead.length === 0;
	}

	protected forward(length: number): void {
		if (length > 0) {
			const deleted = this.ahead.splice(0, length);
			this._at += deleted.length;
		}
	}

	/**
	 * Get the number of characters available in the lookahead buffer.
	 */
	public get lookahead(): number {
		return this.ahead.length;
	}

	/**
	 * Get the text being tokenized.
	 */
	public get text(): string | undefined {
		return this._text;
	}
}

/**
 * Primitive string tokenizer upon which parsers could be built.
 */
export class StringTokenizer extends AStringTokenizer {
	public static forIterator(iterator: StringIterator<string>) {
		return new StringTokenizer(iterator);
	}

	public static forText(text: string, at = 0): StringTokenizer {
		return new StringTokenizer(text[ Symbol.iterator ](), text, at);
	}

	private readonly iterator: Iterator<string, undefined, undefined>;

	protected constructor(iterator: Iterator<string, undefined, undefined>, text?: string | undefined, at = 0) {
		super(text, at);
		this.iterator = iterator;
	}

	/**
	 * Consume up to the given number of characters.  May return
	 * fewer characters if the end of the text is encountered.
	 * @throws {@link RangeError}
	 * For invalid length.
	 */
	public consumeCount(length: number): string {
		this.assertPositiveInt(length);
		if (length === 0) {
			return "";
		}
		this.peek(length - 1);
		const result = this.ahead.slice(0, length).join("");
		this.forward(result.length);
		return result;
	}

	/**
	 * Consume text which is expected to match the given string.
	 * If it does match, return it.  Otherwise, throw an error and
	 * nothing is consumed.
	 * Use {@link tryConsume} if you want to return `undefined`
	 * instead of throwing an error.
	 * @throws {@link ValidationError}
	 * If the exact text cannot be consumed.
	 */
	public consumeExact(exact: string): string {
		if (this.tryConsume(exact)) {
			return exact;
		}
		throw new ValidationError([ {
			expectedType: exact,
			message: "Mismatched text",
		} ], { message: `Could not consume exact text: expected ${ JSON.stringify(exact) } at ${ this._at }, found ${ JSON.stringify(this.ahead.slice(0, exact.length).join("")) }` });
	}

	/**
	 * Helper for "skip past anything which would be considered whitespace".
	 */
	public consumeSpace(): string {
		return this.consumeWhile((t) => /^\s$/.test(t));
	}

	/**
	 * Repeatedly peek ahead for as long as the given predicate returns
	 * `true`, returning the matched text once it returns `false` or
	 * the end of the text is encountered.
	 * Note that the number in the predicate is the relative offset,
	 * the `ahead` value, not the `at` value.  It always starts at zero.
	 */
	public consumeWhile(predicate: BiPredicate<string, number>): string {
		let length = 0;
		let chars: string[] = [];
		let more = true;
		do {
			const next = this.peek(length);
			if (next == null) {
				more = false;
			} else if (predicate(next, length)) {
				chars.push(next);
				length++;
			} else {
				more = false;
			}
		} while (more);
		if (length === 0) {
			return "";
		}
		this.forward(length);
		return chars.join("");
	}

	/**
	 * Get the next character available via the string iterator.
	 * Returns `undefined` if the iterator is done.
	 * Does not modify `at`.
	 */
	protected next(): string | undefined {
		if (this.iteratorDone) {
			return undefined;
		}
		const { done, value } = this.iterator.next();
		if (done === true) {
			this.iteratorDone = true;
		}
		return value;
	}

	/**
	 * Get a character without moving `at`.  If a number is provided,
	 * look that many characters ahead.
	 * @param forward - Number of characters ahead to peek.  Must be at least 0.
	 * @throws {@link RangeError}
	 * For invalid `forward` values.
	 */
	public peek(forward: number = 0): string | undefined {
		this.assertPositiveInt(forward);
		while (this.ahead.length <= forward) {
			const next = this.next();
			if (next == null) {
				return undefined;
			}
			this.ahead.push(next);
		}
		return this.ahead[ forward ];
	}

	/**
	 * Try to consume the given text.  If found, it is consumed and
	 * returned.  If not found, nothing is consumed and `undefined`
	 * is returned.  Use {@link consumeExact} if you want to throw
	 * an error instead of returning `undefined`.
	 */
	public tryConsume(exact: string): boolean {
		if (exact === "") {
			return true;
		}
		const exactLength = exact.length;
		this.peek(exactLength - 1);
		const actual = this.ahead.slice(0, exactLength).join("");
		if (actual !== exact) {
			return false;
		}
		this.forward(exactLength);
		return true;
	}
}

export class AsyncStringTokenizer extends AStringTokenizer {
	public static forText(text: string, at = 0): AsyncStringTokenizer {
		return new AsyncStringTokenizer(asyncIteratorFor(text[Symbol.iterator]()), text, at);
	}

	private readonly iterator: AsyncIterator<string, undefined, undefined>;

	protected constructor(iterator: AsyncIterator<string, undefined, undefined>, text?: string | undefined, at = 0) {
		super(text, at);
		this.iterator = iterator;
	}

	/**
	 * Consume up to the given number of characters.  May return
	 * fewer characters if the end of the text is encountered.
	 * @throws {@link RangeError}
	 * For invalid length.
	 */
	public async consumeCount(length: number): Promise<string> {
		this.assertPositiveInt(length);
		if (length === 0) {
			return "";
		}
		await this.peek(length - 1);
		const result = this.ahead.slice(0, length).join("");
		this.forward(result.length);
		return result;
	}

	public async next(): Promise<string | undefined> {
		if (this.iteratorDone) {
			return undefined;
		}
		const { done, value } = await this.iterator.next();
		if (done) {
			this.iteratorDone = true;
		}
		return value;
	}

	public async peek(forward: number = 0): Promise<string | undefined> {
		this.assertPositiveInt(forward);
		while (this.ahead.length <= forward) {
			const char = await this.next();
			if (char == null) {
				return undefined;
			}
			this.ahead.push(char);
		}
		return this.ahead[ forward ];
	}

	/**
	 * Consume text which is expected to match the given string.
	 * If it does match, return it.  Otherwise, throw an error and
	 * nothing is consumed.
	 * Use {@link tryConsume} if you want to return `undefined`
	 * instead of throwing an error.
	 * @throws {@link ValidationError}
	 * If the exact text cannot be consumed.
	 */
	public async consumeExact(exact: string): Promise<string> {
		if (await this.tryConsume(exact)) {
			return exact;
		}
		throw new ValidationError([ {
			expectedType: exact,
			message: "Mismatched text",
		} ], { message: `Could not consume exact text: expected ${ JSON.stringify(exact) } at ${ this._at }, found ${ JSON.stringify(this.ahead.slice(0, exact.length).join("")) }` });
	}

	/**
	 * Helper for "skip past anything which would be considered whitespace".
	 */
	public consumeSpace(): Promise<string> {
		return this.consumeWhile((t) => /^\s$/.test(t));
	}

	/**
	 * Repeatedly peek ahead for as long as the given predicate returns
	 * `true`, returning the matched text once it returns `false` or
	 * the end of the text is encountered.
	 * Note that the number in the predicate is the relative offset,
	 * the `ahead` value, not the `at` value.  It always starts at zero.
	 */
	public async consumeWhile(predicate: BiPredicate<string, number>): Promise<string> {
		let length = 0;
		let chars: string[] = [];
		let more = true;
		do {
			const next = await this.peek(length);
			if (next == null) {
				more = false;
			} else if (predicate(next, length)) {
				chars.push(next);
				length++;
			} else {
				more = false;
			}
		} while (more);
		if (length === 0) {
			return "";
		}
		this.forward(length);
		return chars.join("");
	}


	/**
	 * Try to consume the given text.  If found, it is consumed and
	 * returned.  If not found, nothing is consumed and `undefined`
	 * is returned.  Use {@link AStringTokenizer#consumeExact} if you want to throw
	 * an error instead of returning `undefined`.
	 */
	public async tryConsume(exact: string): Promise<boolean> {
		if (exact === "") {
			return true;
		}
		const exactLength = exact.length;
		await this.peek(exactLength - 1);
		const actual = this.ahead.slice(0, exactLength).join("");
		if (actual !== exact) {
			return false;
		}
		this.forward(exactLength);
		return true;
	}
}
