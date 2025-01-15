import { scrubStackTrace } from "@rickosborne/guard";
import { TYPED_CHECKED_BOUNDS_KEYS, type TypedCheckedBounds } from "./spec.js";

export const sameBounds = (left: TypedCheckedBounds, right: TypedCheckedBounds): boolean => {
	return TYPED_CHECKED_BOUNDS_KEYS.every((key) => left[key] === right[key]);
};

export function assertSameBounds(
	left: TypedCheckedBounds,
	right: TypedCheckedBounds,
	errorSupplier?: undefined | ((mismatchedKeys: (keyof TypedCheckedBounds)[], left: TypedCheckedBounds, right: TypedCheckedBounds) => Error),
): void {
	const mismatched = TYPED_CHECKED_BOUNDS_KEYS.filter((key) => left[key] !== right[key]);
	if (mismatched.length > 0) {
		let error: Error;
		if (errorSupplier != null) {
			error = errorSupplier(mismatched, left, right);
		} else {
			let message = mismatched.map((key) => `${key}<${left[key]},${right[key]}>`).join(" ");
			message = "Bounds mismatch: ".concat(message);
			error = scrubStackTrace(new RangeError(message));
		}
		throw error;
	}
}
