import { isDigit } from "@rickosborne/guard";
import * as console from "node:console";
import { asyncIteratorFor } from "./iterator.js";
import { TokenGenerator } from "./token-generator.js";

export type JsonPunctuation = "{" | "}" | "[" | "]" | ":" | ",";

export const JSON_PUNCTUATION: readonly JsonPunctuation[] = [ "{", "}", "[", "]", ":", "," ];

interface JsonTokenBase {
	/**
	 * Offset into the text in (UTF-16) characters, regardless of line or row/col position.
	 * Starts at 0.
	 */
	at: number;
	/**
	 * Length of the source string behind this token;
	 */
	length: number;
	/**
	 * Line/row number, starting at 1.
	 */
	line: number;
	/**
	 * Column on the line, starting at 1.
	 */
	pos: number;
	type: JsonTokenTypeT;
}

/**
 * Discriminators for each of the `type` values for {@link JsonToken}.
 */
export const JsonTokenType = Object.freeze({
	Boo: "boolean",
	Nul: "null",
	Num: "number",
	Pun: "pun",
	Spc: "space",
	Str: "string",
});

export type JsonTokenTypeT = (typeof JsonTokenType)[keyof typeof JsonTokenType];

export interface JsonPunctuationToken extends JsonTokenBase {
	type: typeof JsonTokenType.Pun;
	value: JsonPunctuation;
}

export interface JsonNumberToken extends JsonTokenBase {
	type: typeof JsonTokenType.Num;
	value: number;
}

export interface JsonStringToken extends JsonTokenBase {
	type: typeof JsonTokenType.Str;
	value: string;
}

export interface JsonBooleanToken extends JsonTokenBase {
	type: typeof JsonTokenType.Boo;
	value: boolean;
}

export interface JsonNullToken extends JsonTokenBase {
	type: typeof JsonTokenType.Nul;
	value: null;
}

export interface JsonSpaceToken extends JsonTokenBase {
	lines: number;
	offset: number;
	type: typeof JsonTokenType.Spc;
	value: string;
}

export type JsonToken = JsonNullToken | JsonBooleanToken | JsonNumberToken | JsonStringToken | JsonPunctuationToken | JsonSpaceToken;

export class JsonTokenGenerator extends TokenGenerator<JsonToken> {
	public static forIterator(iterator: AsyncIterator<string, undefined, undefined>): JsonTokenGenerator {
		return new JsonTokenGenerator(iterator);
	}

	public static override forText(text: string): JsonTokenGenerator {
		return new JsonTokenGenerator(asyncIteratorFor(text[ Symbol.iterator ]()), text);
	}

	private line: number = 1;
	private pos: number = 1;

	protected async consumeJsonToken(): Promise<JsonToken | undefined> {
		const at = this.at;
		const spaceToken = await this.consumeSpaceAndCount();
		if (spaceToken.length > 0) {
			const line = this.line;
			const pos = this.pos;
			if (spaceToken.lines > 0) {
				this.line += spaceToken.lines;
				this.pos = spaceToken.offset;
			} else {
				this.pos += spaceToken.offset;
			}
			return { ...spaceToken, at, line, pos, type: JsonTokenType.Spc } satisfies JsonSpaceToken;
		}
		const line = this.line;
		const pos = this.pos;
		const char = await this.peek();
		if (char == null) {
			return undefined;
		}
		if (await this.tryConsume("false")) {
			this.pos += 5;
			return { at, length: 5, line, pos, type: JsonTokenType.Boo, value: false };
		}
		if (await this.tryConsume("true")) {
			this.pos += 4;
			return { at, length: 4, line, pos, type: JsonTokenType.Boo, value: true };
		}
		if (await this.tryConsume("null")) {
			this.pos += 4;
			return { at, length: 4, line, pos, type: JsonTokenType.Nul, value: null };
		}
		for (const punctuation of JSON_PUNCTUATION) {
			if (await this.tryConsume(punctuation)) {
				this.pos += 1;
				return { at, length: 1, line, pos, type: JsonTokenType.Pun, value: punctuation };
			}
		}
		if (char === '"') {
			const text = await this.consumeString();
			const length = this.at - at;
			this.pos += length;
			return { at, length, line, pos, type: JsonTokenType.Str, value: text };
		}
		if (char === "-" || isDigit(char)) {
			const num = await this.consumeNumber();
			const length = this.at - at;
			this.pos += length;
			return { at, length, line, pos, type: JsonTokenType.Num, value: num };
		}
		return undefined;
	}

	protected async consumeNumber(): Promise<number> {
		const sign = await this.tryConsume("-") ? -1 : undefined;
		const intPart = await this.consumeWhile(isDigit);
		let fracPart: string | undefined = undefined;
		let value: number;
		if (await this.tryConsume(".")) {
			fracPart = await this.consumeWhile(isDigit);
			value = Number.parseFloat(`${ intPart }.${ fracPart }`);
		} else {
			value = Number.parseInt(intPart, 10);
		}
		if (sign != null) {
			value *= sign;
		}
		if (await this.tryConsume("E") || await this.tryConsume("E")) {
			const expSign = await this.tryConsume("-") ? -1 : await this.tryConsume("+") ? 1 : 1;
			const expText = await this.consumeWhile(isDigit);
			const exponent = expSign * Number.parseInt(expText, 10);
			value *= Math.pow(10, exponent);
		}
		return value;
	}

	protected async consumeSpaceAndCount(): Promise<{ length: number, lines: number; offset: number, value: string }> {
		let length: number = 0;
		let lines: number = 0;
		let offset: number = 0;
		let prev: string = "";
		const value = await this.consumeWhile((t) => {
			if (!/^\s$/.test(t)) {
				return false;
			}
			length++;
			if (t === "\n") {
				if (prev !== "\r") {
					lines++;
				}
				offset = 1;
			} else if (t === "\r") {
				lines++;
				offset = 1;
			} else {
				offset++;
			}
			prev = t;
			return true;
		});
		return { length, lines, offset, value };
	}

	protected async consumeString(): Promise<string> {
		await this.consumeExact('"');
		const chars: string[] = [ '"' ];
		let escaped = false;
		while (true) {
			const char = await this.consumeCount(1);
			if (char === "") {
				throw new Error(`Unterminated string literal at ${ this.at } line ${ this.line }`);
			}
			chars.push(char);
			if (escaped) {
				escaped = false;
			} else if (char === "\\") {
				escaped = true;
			} else if (char === '"') {
				break;
			}
		}
		return JSON.parse(chars.join("")) as string;
	}

	protected onWaiting(): void {
		this.consumeJsonToken()
			.then((token) => {
				if (token != null) {
					this.onToken(token);
				} else {
					this.onDone();
				}
			})
			.catch((err: unknown) => {
				console.error("[JsonTokenGenerator#onWaiting] catch.", err);
				this.multiIterator.onThrow(err);
				throw err;
			});
	}
}
