import { CSSError } from "./css-error.js";

export interface CSSColorToken<Type extends string = string> {
	type: Type;
}

export interface CSSLiteralToken extends CSSColorToken<"literal"> {
	literal: string;
}

export interface CSSHexHashToken extends CSSColorToken<"hex"> {
	hex: string;
}

export interface CSSKeywordToken extends CSSColorToken<"keyword"> {
	keyword: string;
}

export interface CSSFunctionToken extends CSSColorToken<"function"> {
	name: string;
}

export interface CSSNumberToken extends CSSColorToken<"number"> {
	value: number;
}

export interface CSSTokenReaderMatcher<Type extends CSSToken["type"] = CSSToken["type"]> {
	match?: string[] | readonly string[] | Set<string> | undefined;
	type: Type;
}

export type CSSToken = CSSKeywordToken | CSSFunctionToken | CSSHexHashToken | CSSLiteralToken | CSSNumberToken;

export interface CSSTokenReader {
	pull<Type extends CSSToken["type"]>(...matchers: (Type | CSSTokenReaderMatcher<Type>)[]): CSSColorToken<Type> & CSSToken | undefined;
}

/**
 * Minimal CSS pull parser, which only supports the happy-path
 * tokens expected in a CSS color expression.  Does not support
 * anywhere near the full CSS Colors spec, but it'll do in a pinch.
 * @see {@link https://www.w3.org/TR/css-color-4/ | CSS Color Level 4}
 */
export const readFromCSS = (
	text: string,
): CSSTokenReader => {
	let remain = text.trim();
	const done = () => remain.length === 0;
	return {
		pull<Type extends CSSToken["type"]>(...matchers: (Type | CSSTokenReaderMatcher<Type>)[]): CSSColorToken<Type> & CSSToken | undefined {
			if (done()) {
				return undefined;
			}
			for (const matcherOrType of matchers) {
				const matcher = typeof matcherOrType === "string" ? { type: matcherOrType } : matcherOrType;
				const { type, match } = matcher;
				let pattern: RegExp;
				let builder: (text: string) => CSSToken;
				const matchSet = match == null ? new Set<string>() : match instanceof Set ? match : typeof match === "string" ? new Set<string>(match) : new Set<string>(match);
				switch (type) {
					case "number": {
						pattern = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?/;
						builder = (f) => ({ type: "number", value: parseFloat(f) });
						break;
					}
					case "function": {
						pattern = /^(\w+)\(/;
						builder = (name) => ({ name, type: "function" });
						break;
					}
					case "hex": {
						pattern = /^#[a-fA-F0-9]+/;
						builder = (hex) => ({ hex, type: "hex" });
						break;
					}
					case "keyword": {
						pattern = /^\p{ID_Start}[-\p{ID_Continue}]*/u;
						builder = (keyword) => ({ keyword, type: "keyword" });
						break;
					}
					case "literal": {
						if (matchSet.size == 0) {
							throw new CSSError(text, { expected: "match[]", message: "Unspecified literal" });
						}
						pattern = new RegExp("^".concat(Array.from(matchSet).map((t) => t.replace(/([\\()[\].^${}])/g, "\\$1")).join("|")));
						builder = (literal) => ({ literal, type: "literal" });
						break;
					}
					default: {
						throw new CSSError(type, { expected: "type", message: `Unknown token type: ${ type }` });
					}
				}
				const peek = pattern.exec(remain);
				if (peek != null) {
					let remove = peek[ 0 ];
					let matched = peek[ 1 ] ?? peek[ 0 ];
					if (matchSet.has(matched) || matchSet.size === 0) {
						remain = remain.substring(remove.length).trim();
						return builder(matched) as CSSColorToken<Type> & CSSToken;
					}
				}
			}
			return undefined;
		},
	};
};
