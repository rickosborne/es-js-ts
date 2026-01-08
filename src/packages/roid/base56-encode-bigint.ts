import { BASE56_ALPHABET, BASE56_BIG_BASE } from "./base56.js";

let base56Chars: string[] | undefined;

/**
 * Encode a bigint into text using the base56 character set.
 */
export const base56EncodeBigint = (big: bigint): string => {
	base56Chars ??= BASE56_ALPHABET.split("");
	const chars: string[] = [];
	let num: bigint = big;
	while (num > 0) {
		const digit = Number(num % BASE56_BIG_BASE);
		num /= BASE56_BIG_BASE;
		const char = base56Chars[digit]!;
		chars.unshift(char);
	}
	return chars.join("");
};
