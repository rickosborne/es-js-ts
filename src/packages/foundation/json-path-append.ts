import { DQ, reQuote, SQ } from "./re-quote.js";

export const JSON_PATH_ROOT = "$" as const;

export interface JsonPathAppendOptions {
	/**
	 * Provide a preference for quote characters, if needed.
	 */
	quotes?: "auto" | typeof DQ | typeof SQ;
}

/**
 * Append the given property key to the given JSON Path expression.
 * This does not attempt to validate anything about the path or the key,
 * only formats it according to very basic rules.  Technically, the
 * spec doesn't handle symbol values, so if you give it a path with
 * a symbol you get an expression which other JSON Path parsers can't
 * handle.  However, it does use the correct function syntax, so it
 * should still at least parse correctly.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc9535 | RFC9535}
 */
export const jsonPathAppend = (
	path: string,
	key: string | number | symbol,
	options: JsonPathAppendOptions = {},
): string => {
	let text: string;
	if (typeof key === "number") {
		if (Math.floor(key) === key) {
			return path.concat("[", String(key), "]");
		}
		text = String(key);
	} else if (typeof key !== "string") {
		text = key.description == null ? "undefined" : JSON.stringify(key.description);
		return path.concat("[?Symbol(", text, ")]");
	} else if (/^[\p{ID_Start}_]\p{ID_Continue}*$/u.test(key)) {
		return path.concat(".", key);
	} else {
		text = key;
	}
	text = reQuote(text, options.quotes === SQ ? { quotes: SQ } : options.quotes === DQ ? { quotes: DQ } : undefined);
	return path.concat("[", text, "]");
};
