/**
 * Split a string into fixed-width substrings.  The last one may be short.
 */
export const splitFixed = (
	text: string,
	width: number,
): string [] => {
	const split: string[] = [];
	for (let i = 0; i < text.length; i += width) {
		split.push(text.substring(i, i + width));
	}
	return split;
};
