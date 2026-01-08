import { BASE56_ALPHABET } from "./base56.js";

let base56Map: Map<string, number> | undefined = undefined;

/**
 * Decode base64-encoded text into a BigInt.
 * If an error is encountered, it is returned instead of thrown.
 * You probably don't want to use this for long text, as it does everything in memory with lots of BigInt math.
 */
export const bigintFromBase56 = (text: string): [ error: SyntaxError, big: undefined ] | [ error: undefined, big: bigint ] => {
	base56Map ??= new Map(BASE56_ALPHABET.split("").map((c, n) => [ c, n ]));
	const chars = text.split("");
	const ords = chars.map((c) => base56Map!.get(c));
	let big: bigint = 0n;
	for (let i = 0; i < ords.length; i++) {
		const ord = ords[ i ];
		if (ord == null) {
			return [ new SyntaxError(`Bad character ${ JSON.stringify(text.substring(i, i + 1)) } in base56 text at index ${ i }`), undefined ];
		}
		big = (big * 56n) + BigInt(ord);
	}
	return [ undefined, big ];
};
