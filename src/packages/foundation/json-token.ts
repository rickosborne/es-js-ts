export type JsonPunctuation = "{" | "}" | "[" | "]" | ":" | ",";

export const JSON_PUNCTUATION: readonly JsonPunctuation[] = [ "{", "}", "[", "]", ":", "," ];

export interface JsonTokenBase {
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
