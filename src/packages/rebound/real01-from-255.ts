import { isInt } from "@rickosborne/guard";
import type { Int255 } from "./int255.js";
import { int255 } from "./int255.js";
import type { Real01 } from "./real01.js";
import { real01 } from "./real01.js";
import type { Real255 } from "./real255.js";
import { real255 } from "./real255.js";

/**
 * Convert a {@link Real255} or {@link Int255} to a {@link Real01}.
 */
export function real01From255(value: number | Int255 | Real255): Real01;
export function real01From255(value: undefined): undefined;
export function real01From255(value: number | Int255 | Real255 | undefined): Real01 | undefined;
export function real01From255(value: number | Int255 | Real255 | undefined): Real01 | undefined {
	if (value == null) {
		return undefined;
	}
	const range = isInt(value) ? int255.range : real255.range;
	return real01.range.scaleValueFrom(value, range) as Real01;
}
