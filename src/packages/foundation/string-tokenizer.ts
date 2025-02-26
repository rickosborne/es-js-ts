import { ValidationError } from "@rickosborne/guard";
import type { BiPredicate } from "@rickosborne/typical";

/**
 * Primitive string tokenizer upon which parsers could be built.
 */
export class StringTokenizer {
	private _at: number;
	private readonly _text: string;
	private readonly ahead: string[] = [];
	private readonly iterator: StringIterator<string>;
	private iteratorDone: boolean = false;

	constructor(text: string, at?: number | undefined) {
		this._text = text;
		this._at = Math.max(0, Math.min(text.length, at ?? 0));
		this.iterator = this._at === 0 ? text[ Symbol.iterator ]() : text.substring(this._at)[ Symbol.iterator ]();
	}

	/**
	 * Get the location of the next character available to be consumed.
	 */
	public get at(): number {
		return this._at;
	}

	/**
	 * Consume up to the given number of characters.  May return
	 * fewer characters if the end of the text is encountered.
	 * @throws {@link RangeError}
	 * For invalid length.
	 */
	public consumeCount(length: number): string {
		if (length < 0 || !Number.isSafeInteger(length)) {
			throw new RangeError("Invalid length");
		}
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
	 * Whether all the text has already been tokenized.
	 */
	public get done(): boolean {
		return this._at >= this._text.length;
	}

	private forward(length: number): void {
		if (length > 0) {
			this.ahead.splice(0, length);
			this._at = Math.min(this._at + length, this._text.length);
		}
	}

	/**
	 * Get the number of characters available in the lookahead buffer.
	 */
	public get lookahead(): number {
		return this.ahead.length;
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
		if (forward < 0 || !Number.isSafeInteger(forward)) {
			throw new RangeError("peek(ahead) must be >= 0");
		}
		while (this.ahead.length <= forward) {
			const next = this.next();
			if (next == null) {
				return undefined;
			}
			this.ahead.push(next);
		}
		return this.ahead[ forward ]!;
	}

	/**
	 * Get the text being tokenized.
	 */
	public get text(): string {
		return this._text;
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
