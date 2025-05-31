export type ReQuoteOptions = {
	/**
	 * Use the quotes which would produce the fewest escapes,
	 * with a slight preference for double quotes.
	 */
	auto?: true;
	quotes?: never;
} | {
	auto?: never;
	/**
	 * Use the given quote character(s).  If one character, use
	 * it for both start and end.  If two, use them in the order
	 * provided.
	 */
	quotes?: string;
};

export const DQ = '"' as const;
export const SQ = "'" as const;

/**
 * Given a text, either wrap it in quotes which make the most sense
 * for the text, or change the quotes to a different set.
 */
export const reQuote = (text: string, options: ReQuoteOptions = {}) => {
	const quotes = options.quotes;
	const auto = options.auto === true || quotes == null;
	let lq: string | undefined;
	let rq: string | undefined;
	if (quotes?.length === 1) {
		lq = quotes;
		rq = quotes;
	} else if (quotes?.length === 2) {
		lq = quotes.substring(0, 1);
		rq = quotes.substring(1);
	} else if (quotes === "" || (quotes?.length ?? 0) > 2) {
		throw new Error(`Too many quote characters: ${ JSON.stringify(quotes) }`);
	} else {
		lq = undefined;
		rq = undefined;
	}
	let unquoted: string = text;
	if (text.length >= 2) {
		const first = text.substring(0, 1);
		const last = text.substring(text.length - 1);
		if (first === lq && last === rq) {
			// Already quoted correctly
			return text;
		}
		if (first === last && (first === DQ || first === SQ)) {
			const esc = new RegExp(`(?<!\\\\)\\\\${rq}`, "g");
			unquoted = text.substring(1, text.length - 1)
				.replace(esc, last);
			if (auto && !unquoted.includes(last)) {
				// Already quoted and acceptable.
				return text;
			}
		}
	}
	if (lq == null || rq == null) {
		const chars = unquoted.split("");
		const dqCount = chars.filter((c) => c === DQ).length;
		if (dqCount === 0) {
			lq = DQ;
			rq = DQ;
		} else {
			const sqCount = chars.filter((c) => c === SQ).length;
			if (sqCount === 0 || sqCount < dqCount) {
				lq = SQ;
				rq = SQ;
			} else {
				lq = DQ;
				rq = DQ;
			}
		}
	}
	if (lq === DQ && rq === DQ) {
		return JSON.stringify(unquoted);
	}
	const escaped = unquoted.replace(new RegExp(rq, "g"), `\\${rq}`);
	return lq.concat(escaped, rq);
};
