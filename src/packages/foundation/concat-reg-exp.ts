/**
 * Concatenate the patterns (and flags) of regular expressions so they will
 * match all at once.  This does not attempt to fix any problems, such as
 * duplicate named capture groups or incorrectly-numbered backreferences.
 */
export const concatRegExp = (...patterns: RegExp[]): RegExp => {
	let joined = "";
	const flagSet = new Set<string>();
	const addFlags = (flags: string): void => {
		flags.split("").forEach((flag) => flagSet.add(flag));
	};
	let index = 0;
	const lastIndex = patterns.length - 1;
	for (const pattern of patterns) {
		let source = pattern.source;
		if (index < lastIndex) {
			source = source.replace(/(?<=[^\\]|\\\\)\$$/, "");
		}
		if (index > 0) {
			source = source.replace(/^\^/, "");
		}
		joined = joined.concat(source);
		addFlags(pattern.flags);
		index++;
	}
	return new RegExp(joined, Array.from(flagSet).join(""));
};
