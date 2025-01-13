import { isInt } from "@rickosborne/guard";
import { roundTo } from "./round-to.js";

/**
 * String-format a number rounded to the given resolution, where
 * human readability is more important than precision.
 */
export const imprecise = (num: number, resolution = 0.01): string => {
	if (isInt(num)) {
		return String(num);
	}
	const rounded = roundTo(num, resolution);
	let [ whole, part ] = String(rounded).split(".") as [string, string | undefined];
	if (part == null || resolution >= 1) {
		return whole;
	}
	const precision = Math.max(1, Math.ceil(Math.abs(Math.log10(resolution))));
	part = part.substring(0, precision)
		.replace(/0+$/, "");
	if (part === "") {
		return whole;
	}
	return whole.concat(".", part);
};
