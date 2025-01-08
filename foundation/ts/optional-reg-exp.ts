/**
 * Modify a regular expression's pattern to make the entire expression optional,
 * keeping any start/end anchors in place
 */
export const optionalRegExp = (pattern: RegExp): RegExp => {
	let { source, flags } = pattern;
	let prefix = "";
	let suffix = "";
	if (source.startsWith("^")) {
		prefix = "^";
		source = source.replace(/^\^/, "");
	}
	let lengthBefore = source.length;
	source = source.replace(/(?<=[^\\]|\\\\)\$$/, "");
	if (source.length < lengthBefore) {
		suffix = "$";
	}
	source = `${ prefix }(?:${ source })?${ suffix }`;
	return new RegExp(source, flags);
};
