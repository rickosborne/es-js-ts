import { isDigit } from "@rickosborne/guard";
import { entriesOf } from "./entries-of.js";
import { StringTokenizer } from "./string-tokenizer.js";

/**
 * ISO8601-like measure of a duration.  Does not include
 * any concept of being relative to any specific date.
 */
export interface Duration {
	day?: number;
	hour?: number;
	minute?: number;
	month?: number;
	second?: number;
	week?: number;
	year?: number;
}

/**
 * A duration parsed from text, which includes the extracted
 * (serialized) duration text.
 */
export interface DurationWithText extends Duration {
	text: string;
}

/**
 * ISO-8601 designator for a duration value.
 */
export type DurationDesignator = "Y" | "M" | "W" | "D" | "T" | "H" | "S";

export const DURATION_DESIGNATORS: readonly DurationDesignator[] = Object.freeze([ "Y", "M", "W", "D", "T", "H", "S" ]);

export const DURATION_TIME_DESIGNATORS: readonly DurationDesignator[] = Object.freeze([ "H", "M", "S" ]);

export const DURATION_DATE_DESIGNATORS: readonly DurationDesignator[] = Object.freeze([ "Y", "M", "W", "D" ]);

/**
 * Map between {@link DurationDesignator} and {@link Duration} property name.
 * Does not include `M`, which is ambiguous, nor `T` which does not
 * correspond to a property.
 */
export const DURATION_KEY_BY_DESIGNATOR = Object.freeze({
	Y: "year",
	D: "day",
	H: "hour",
	S: "second",
	W: "week",
} as const satisfies Partial<Record<DurationDesignator, keyof Duration>>);

/**
 * Parse an ISO-8601 duration from the given text.  If the text contains
 * extra non-duration characters after, will only throw an error if they
 * would produce an ambiguous result, or could indicate an incomplete
 * duration.
 * @throws {@link SyntaxError}
 * For text which is not a valid ISO-8601 duration.
 */
export const parseDuration = (text: string): DurationWithText => {
	const duration: DurationWithText = { text };
	const chars = Array.from(text);
	const count = chars.length;
	const tokenizer = StringTokenizer.forText(text);
	const allSign = tokenizer.tryConsume("-") ? -1 : 1;
	if (count < 1 || !tokenizer.tryConsume("P")) {
		throw new SyntaxError("Invalid Duration at 0");
	}
	let inTime = false;
	while (!tokenizer.done) {
		const sign = tokenizer.tryConsume("-") ? -allSign : allSign;
		const intText = tokenizer.consumeWhile(isDigit);
		let value = 0;
		if (intText !== "") {
			if (tokenizer.tryConsume(".") || tokenizer.tryConsume(",")) {
				const fracText = tokenizer.consumeWhile(isDigit);
				if (tokenizer.tryConsume(".") || tokenizer.tryConsume(",")) {
					throw new SyntaxError(`Invalid decimal number in Duration at ${ tokenizer.at - 1 }`);
				}
				value = sign * Number.parseFloat(`${ intText }.${ fracText }`);
			} else {
				value = sign * Number.parseInt(intText, 10);
			}
		}
		let designator: DurationDesignator | undefined = undefined;
		for (const maybe of DURATION_DESIGNATORS) {
			if (tokenizer.tryConsume(maybe)) {
				designator = maybe;
				break;
			}
		}
		if (designator == null) {
			if (intText !== "" || sign !== allSign) {
				throw new SyntaxError(`Missing designator in Duration at ${ tokenizer.at }`);
			}
			break;
		}
		if (designator === "T") {
			if (inTime) {
				throw new SyntaxError(`Duplicate T designator in Duration at ${ tokenizer.at - 1 }`);
			}
			inTime = true;
			continue;
		}
		let propName: keyof Duration;
		if (designator === "M") {
			propName = inTime ? "minute" : "month";
		} else {
			if (DURATION_DATE_DESIGNATORS.includes(designator) && inTime) {
				throw new SyntaxError(`Designator ${ designator } at ${ tokenizer.at - 1 } is only valid before the T in a Duration`);
			} else if (DURATION_TIME_DESIGNATORS.includes(designator) && !inTime) {
				throw new SyntaxError(`Designator ${ designator } at ${ tokenizer.at - 1 } is only valid after the T in a Duration`);
			}
			propName = DURATION_KEY_BY_DESIGNATOR[ designator ];
		}
		if (duration[ propName ] != null) {
			throw new SyntaxError(`Duplicate designator ${ designator } at ${ tokenizer.at - 1 } in Duration`);
		}
		duration[ propName ] = value;
	}
	if (!tokenizer.done) {
		duration.text = text.substring(0, tokenizer.at);
	}
	return duration;
};

/**
 * Lookup table for the conversion of a {@link Duration} property
 * value to seconds.  Does not include `month` or `year`, which
 * have variable numbers of days.
 */
export const DURATION_KEY_SECONDS: Readonly<Required<Omit<Duration, "month" | "text" | "year">>> = Object.freeze({
	second: 1,
	minute: 60,
	hour: 3_600,
	day: 86_400,
	week: 604_800,
});

/**
 * Convert a given duration to an equivalent number of seconds.
 * @throws {@link RangeError}
 * If the duration contains `year` or `month`, which have variable
 * numbers of seconds, or if one of the duration properties has a
 * non-numeric value.
 */
export const secondsFromDuration = (duration: Partial<DurationWithText>): number => {
	let seconds = 0;
	for (const [ key, value ] of entriesOf(duration)) {
		if (key === "text") {
			continue;
		}
		if (typeof value !== "number") {
			throw new RangeError(`Unexpected ${ typeof value } in ${ key } of Duration`);
		}
		if (value === 0) {
			continue;
		}
		const multiplier = DURATION_KEY_SECONDS[ key as keyof typeof DURATION_KEY_SECONDS ];
		if (multiplier == null) {
			throw new RangeError("Cannot convert Duration to seconds");
		}
		seconds += multiplier * value;
	}
	return seconds;
};

export const formatDuration = (duration: Duration): string => {
	let parts: string[] = [ "P" ];
	for (const designators of [ DURATION_DATE_DESIGNATORS, DURATION_TIME_DESIGNATORS ]) {
		if (designators === DURATION_TIME_DESIGNATORS) {
			parts.push("T");
		}
		for (const designator of designators) {
			let propName: keyof Duration;
			if (designator === "M") {
				propName = designators === DURATION_DATE_DESIGNATORS ? "month" : "minute";
			} else {
				propName = DURATION_KEY_BY_DESIGNATOR[ designator as keyof typeof DURATION_KEY_BY_DESIGNATOR ];
			}
			const value = duration[ propName ];
			if (value == null) {
				continue;
			}
			parts.push(String(value), designator);
		}
	}
	return parts.join("");
};
