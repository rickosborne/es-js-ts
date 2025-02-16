/**
 * Match the given simple-* glob against the given text.
 * This _does not_ use "filesystem glob" logic.  That is, a `*` here
 * will match anything, including `/`.  Similarly, there is no `?`
 * operator.
 */
export const simpleStarMatch = (glob: string, text: string): boolean => {
	const parts = starMatchParts(glob);
	let at = 0;
	const count = parts.length;
	const last = count - 1;
	for (let n = 0; n < count; n++) {
		const { type, value } = parts[ n ]!;
		if (type === "text") {
			const nextIndex = text.indexOf(value, at);
			if (nextIndex < at) return false;
			if (n === 0 && nextIndex !== 0) return false;
			at = nextIndex + value.length;
		} else if (n === last) {
			return true;
		}
	}
	if (at === text.length) return true;
	const lastPart = parts.at(-1);
	// Could have matched the last part to an earlier match.
	return parts.length > 1 && lastPart?.type === "text" && text.endsWith(lastPart.value);
};

/**
 * @internal
 */
interface StarGlobText {
	at: number;
	type: "text";
	value: string;
}

/**
 * @internal
 */
interface StarGlobStar {
	at: number;
	type: "*";
	value?: never;
}

export type StarGlobPart = StarGlobText | StarGlobStar;

/**
 * Parse a simple-* glob into its constituent tokens.
 */
export const starMatchParts = (glob: string): StarGlobPart[] => {
	const chars = Array.from(glob);
	let part: string[] = [];
	let parts: StarGlobPart[] = [];
	let startAt = 0;
	const finishPart = () => {
		if (part.length > 0) {
			parts.push({ at: startAt, type: "text", value: part.join("") });
			part = [];
		}
	};
	for (let i = 0; i < chars.length; i++) {
		const char = chars[ i ]!;
		if (char === "\\") {
			const next = chars.at(i + 1);
			if (next === "*" || next === "\\") {
				i++;
				part.push(next);
				continue;
			}
		}
		if (char === "*") {
			finishPart();
			parts.push({ at: i, type: "*" });
			while (chars[ i + 1 ] === "*") i++;
			startAt = i + 1;
		} else {
			part.push(char);
		}
	}
	finishPart();
	return parts;
};
