import { int255, type Int255 } from "./int255.js";
import { real01, type Real01 } from "./real01.js";

/**
 * Convert a {@link Real01} to an {@link Int255}.
 */
export function int255From01(value: Real01): Int255;
export function int255From01(value: undefined): undefined;
export function int255From01(value: Real01 | undefined): Int255 | undefined {
	if (value == null) {
		return undefined;
	}
	// return fair(value);
	// return Math.min(255, Math.trunc(value * 256)) as Int255;
	return int255.range.scaleValueFrom(value, real01.range) as Int255;
}
