import { isDigit } from "@rickosborne/guard";
import type { JsonToken } from "./json-token.js";
import { type AsyncStringIterable, singleCharactersOf, singleCharactersOfAsync, type StringIterable } from "./single-characters-of.js";

const countBreaks = (space: string[]): { lines: number; offset: number } => {
	let lines = 0;
	let offset = 0;
	space.forEach((c, n) => {
		if (c === "\r" || (c === "\n" && (n === 0 || space[ n - 1 ] !== "\r"))) {
			lines++;
			offset = 1;
		} else {
			offset++;
		}
	});
	return { lines, offset };
};

const IN_INT = 2;
const IN_FRAC = 3;
const IN_EXP_SIGN = 4;
const IN_EXP = 5;

interface JsonPushTokenizerStateResult {
	consumed: boolean;
	lines?: number | undefined;
	nextState?: AJsonPushParserState | undefined;
	offset?: number;
	tokens?: JsonToken[] | undefined;
}

abstract class AJsonPushParserState {
	abstract onChar(char: string, at: number, line: number, pos: number, recent: string[]): JsonPushTokenizerStateResult;
}

class JsonStringPushParserState extends AJsonPushParserState {
	private readonly chars: string[] = [];
	private escaped = false;

	public constructor(firstChar: string) {
		super();
		this.chars.push(firstChar);
	}

	public onChar(char: string, at: number, line: number, pos: number, recent: string[]): JsonPushTokenizerStateResult {
		let tokens: JsonToken[] | undefined = undefined;
		this.chars.push(char);
		let nextState: AJsonPushParserState | undefined = undefined;
		if (this.escaped) {
			this.escaped = false;
		} else if (char === "\\") {
			this.escaped = true;
		} else if (char === '"') {
			const length = this.chars.length;
			const value: unknown = JSON.parse(this.chars.join(""));
			if (typeof value !== "string") {
				throw new Error(`String parsing failed at ${ at }, line ${ line }, pos ${ pos - length }: ${ recent.join("") }`);
			}
			tokens = [ { at: at - length + 1, length, line, pos: pos - length + 1, type: "string", value: value } ];
			nextState = new JsonUnknownPushParserState();
		}
		return { consumed: true, nextState, tokens };
	}
}

type NumberState = typeof IN_INT | typeof IN_FRAC | typeof IN_EXP | typeof IN_EXP_SIGN;

class JsonNumberPushParserState extends AJsonPushParserState {
	private readonly chars: string[] = [];
	private state: NumberState = IN_INT;

	public constructor(firstChar: string) {
		super();
		this.chars.push(firstChar);
	}

	protected buffer(char: string, state = this.state): JsonPushTokenizerStateResult {
		this.chars.push(char);
		this.state = state;
		return { consumed: true };
	}

	public onChar(char: string, at: number, line: number, pos: number, recent: string[]): JsonPushTokenizerStateResult {
		if (this.state === IN_INT) {
			if (char === ".") {
				return this.buffer(char, IN_FRAC);
			}
		}
		if (this.state === IN_INT || this.state === IN_FRAC) {
			if (char === "e" || char === "E") {
				return this.buffer(char, IN_EXP_SIGN);
			}
		}
		if (this.state === IN_EXP_SIGN) {
			if (char === "+" || char === "-") {
				return this.buffer(char);
			}
			this.state = IN_EXP;
		}
		if (this.state === IN_INT || this.state === IN_FRAC || this.state === IN_EXP) {
			if (isDigit(char)) {
				return this.buffer(char);
			}
			// The current char is not part of the number, which means both:
			// 1. We should have a number in `chars`, so it must have length > 0.
			// 2. The final character of `chars` (`prev`) should have been a digit,
			//    as all other characters should not terminate a number.
			const prev = this.chars.at(-1);
			if (this.chars.length === 0 || !isDigit(prev)) {
				throw new Error(`Failed to parse number at ${ at }, line ${ line }, ${ pos }: ${ recent.join("") }`);
			}
		}
		if (this.state === IN_INT || this.state === IN_FRAC || this.state === IN_EXP) {
			// terminate the number.
			let value: number;
			const text = this.chars.join("");
			if (this.state === IN_INT) {
				value = Number.parseInt(text, 10);
			} else {
				value = Number.parseFloat(text);
			}
			const length = this.chars.length;
			const tokens: JsonToken[] = [ { at: at - length, length, line: line, pos: pos - length, type: "number", value } ];
			const nextState = new JsonUnknownPushParserState();
			return { consumed: false, nextState, tokens };
		}
		throw new Error("Unexpected end of number");
	}
}

class JsonKeywordPushParserState extends AJsonPushParserState {
	private readonly chars: string[] = [];
	private readonly keyword: string;

	public constructor(keyword: string, firstChar: string) {
		super();
		this.keyword = keyword;
		this.chars.push(firstChar);
	}

	public onChar(char: string, at: number, line: number, pos: number, recent: string[]): JsonPushTokenizerStateResult {
		const keyword = this.keyword;
		const chars = this.chars;
		let tokens: JsonToken[] | undefined = undefined;
		let nextState: AJsonPushParserState | undefined = undefined;
		if (char !== keyword.substring(chars.length, chars.length + 1)) {
			throw new Error(`Failed to parse '${ keyword }' at ${ at }, line ${ line }, pos ${ pos }: ${ recent.join("") }`);
		} else {
			chars.push(char);
			const length = keyword.length;
			if (chars.length === length) {
				const startingPos = pos - length + 1;
				const startedAt = at - length + 1;
				if (keyword === "null") {
					tokens = [ { at: startedAt, length, line, pos: startingPos, type: "null", value: null } ];
				} else if (keyword === "true") {
					tokens = [ { at: startedAt, length, line, pos: startingPos, type: "boolean", value: true } ];
				} else if (keyword === "false") {
					tokens = [ { at: startedAt, length, line, pos: startingPos, type: "boolean", value: false } ];
				} else {
					throw new Error(`Unknown keyword '${ keyword }' at ${ at }, line ${ line }, pos ${ pos }`);
				}
				nextState = new JsonUnknownPushParserState();
			}
		}
		return { consumed: true, nextState, tokens };
	}
}

class JsonSpacePushParserState extends AJsonPushParserState {
	private readonly chars: string[] = [];
	private startingLine: number | undefined;
	private startingPos: number | undefined;

	public constructor(firstChar: string) {
		super();
		this.chars.push(firstChar);
	}

	public onChar(char: string, at: number, line: number, pos: number): JsonPushTokenizerStateResult {
		this.startingLine ??= line;
		this.startingPos ??= pos - 1;
		if (/^\s$/.test(char)) {
			this.chars.push(char);
			return { consumed: true };
		}
		const { lines, offset } = countBreaks(this.chars);
		let length = this.chars.length;
		const value = this.chars.join("");
		const tokens: JsonToken[] = [ { at: at - length, length, line: this.startingLine, lines, offset, pos: this.startingPos, type: "space", value } ];
		const nextState = new JsonUnknownPushParserState();
		return { consumed: false, lines, nextState, offset, tokens };
	}
}

class JsonUnknownPushParserState extends AJsonPushParserState {
	public onChar(char: string, at: number, line: number, pos: number, recent: string[]): JsonPushTokenizerStateResult {
		let tokens: JsonToken[] | undefined = undefined;
		let nextState: AJsonPushParserState | undefined;
		if (char === "-" || isDigit(char)) {
			nextState = new JsonNumberPushParserState(char);
		} else if (char === "t") {
			nextState = new JsonKeywordPushParserState("true", char);
		} else if (char === "f") {
			nextState = new JsonKeywordPushParserState("false", char);
		} else if (char === "n") {
			nextState = new JsonKeywordPushParserState("null", char);
		} else if (char === '"') {
			nextState = new JsonStringPushParserState(char);
		} else if (/^\s$/.test(char)) {
			nextState = new JsonSpacePushParserState(char);
		} else if (char === "{" || char === "}" || char === "[" || char === "]" || char === "," || char === ":") {
			tokens = [ { at, length: 1, line, pos, type: "pun", value: char } ];
			nextState = undefined;
		} else if (char !== "") {
			throw new Error(`Unexpected character ${ JSON.stringify(char) } at ${ at }, line ${ line }, ${ pos }: ${ recent.join("") }`);
		}
		return { consumed: true, nextState, tokens };
	}
}

export class JsonPushTokenizer {
	private at = -1;
	private line = 1;
	private pos = 0;
	private readonly recent: string[] = [];
	private state: AJsonPushParserState = new JsonUnknownPushParserState();

	public onChar(char: string): JsonToken[] {
		const at = ++this.at;
		this.pos++;
		let consumed = false;
		const recent = this.recent;
		recent.push(char);
		while (this.recent.length > 20) {
			recent.shift();
		}
		const tokens: JsonToken[] = [];
		do {
			const result = this.state.onChar(char, at, this.line, this.pos, recent);
			consumed = result.consumed;
			if (result.lines != null && result.lines > 0) {
				this.line++;
				this.pos = result.offset ?? 1;
			}
			if (result.nextState != null) {
				this.state = result.nextState;
			}
			if (result.tokens != null && result.tokens.length > 0) {
				result.tokens.forEach((token) => tokens.push(token));
			}
		} while (!consumed);
		return tokens;
	}
}

export function* jsonTokensOf(...its: StringIterable[]): Generator<JsonToken, void, undefined> {
	// const tokenizer = jsonPushTokenizer();
	const parser = new JsonPushTokenizer();
	for (const char of singleCharactersOf(...its)) {
		const tokens = parser.onChar(char);
		if (tokens.length > 0) {
			for (const token of tokens) {
				yield token;
			}
		}
	}
	// Send a final empty string through to catch any trailing space.
	for (const token of parser.onChar("")) {
		yield token;
	}
}

export async function* jsonTokensOfAsync(...its: AsyncStringIterable[]): AsyncGenerator<JsonToken, void, undefined> {
	// const tokenizer = jsonPushTokenizer();
	const parser = new JsonPushTokenizer();
	for await (const char of singleCharactersOfAsync(...its, "")) {
		const tokens = parser.onChar(char);
		if (tokens.length > 0) {
			for (const token of tokens) {
				yield token;
			}
		}
	}
	// Send a final empty string through to catch any trailing space.
	for (const token of parser.onChar("")) {
		yield token;
	}
}
