/**
 * Convert a number to a string and left-pad it out to the given length with zeroes.
 */
export const zeroPad = (num: number, length: number, radix = 10): string => {
	let text = num.toString(radix);
	if (text.length < length) {
		text = "0".repeat(length - text.length).concat(text);
	}
	return text;
};
