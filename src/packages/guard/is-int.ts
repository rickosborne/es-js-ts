import type { MessageOrError } from "./error-from-message.js";
import { errorFromMessageOrError } from "./error-from-message.js";

/**
 * Check whether the given value is not just numeric, but is
 * also an integer.
 */
export const isInt = (obj: unknown): obj is number => typeof obj === "number" && !isNaN(obj) && Math.trunc(obj) === obj && obj !== Infinity && obj !== -Infinity;

/**
 * Throw if the given value is not an integer.
 */
export function assertInt(value: unknown, messageOrError: MessageOrError): asserts value is number {
	if (!isInt(value)) {
		throw errorFromMessageOrError(messageOrError, TypeError);
	}
}

/**
 * Coerce a value's type to a number, throwing if it's not an integer.
 */
export const expectInt = (
	obj: unknown,
	messageOrError: MessageOrError,
): number => {
	assertInt(obj, messageOrError);
	return obj;
};

/**
 * Convert to an integer, if it seems like it could be done safely.
 * See {@link https://en.wikipedia.org/wiki/Decimal_separator | decimal separator on Wikipedia}
 * for details on how this is probably very wrong in many countries.
 */
export const maybeInt = (
	text: string,
): number | undefined => {
	let sign = 1;
	let clean = text.trim();
	// This just makes the patterns below a little easier.
	if (text.startsWith("-")) {
		sign = -1;
		clean = clean.substring(1);
	}
	clean = clean
		.replace(/(?<=\d)[_  ](?=\d)/g, "")
		.replace(/^0+[,'.·]0*$/, "0")
		.replace(/^(\d+(?:,\d+)+)[.·]0*$/, (_all, digits: string) => digits.replace(/[^-0-9]/g, ""))
		.replace(/^(\d+(?:'\d+)+)[.,]0*$/, (_all, digits: string) => digits.replace(/[^-0-9]/g, ""))
		.replace(/^(\d+(?:\.\d+)+)[,']0*$/, (_all, digits: string) => digits.replace(/[^-0-9]/g, ""))
		.replace(/^(\d{4,})[,'.·]0*$/, (_all, digits: string) => digits.replace(/[^-0-9]/g, ""))
	;
	if (/^-?(0|[1-9][0-9]*)$/.test(clean)) {
		return parseInt(clean, 10) * sign;
	}
	return undefined;
};

