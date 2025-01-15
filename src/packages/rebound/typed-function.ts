import { addProperties } from "@rickosborne/foundation";
import { rangeFromChecked } from "./range.js";
import type { CheckedBounds, TypedCheckedBounds } from "./spec.js";

export const addTypedProperties = <T extends object, Bounds extends CheckedBounds>(
	target: T,
	bounds: Bounds,
	typeName: string,
	fnName: string,
): T & TypedCheckedBounds => {
	const { isInt, isUpperInc, isLowerInc, lower, upper } = bounds;
	const range = "range" in bounds && typeof bounds.range === "string" ? bounds.range : rangeFromChecked(bounds);
	return addProperties(target, {
		isLowerInc: { value: isLowerInc, enumerable: true, configurable: false, writable: false },
		isInt: { value: isInt, enumerable: true, configurable: false, writable: false },
		isUpperInc: { value: isUpperInc, enumerable: true, configurable: false, writable: false },
		lower: { value: lower, enumerable: true, configurable: false, writable: false },
		name: { value: fnName, enumerable: false, configurable: true, writable: false },
		range: { value: range, enumerable: true, configurable: false, writable: false },
		typeName: { value: typeName, enumerable: true, configurable: false, writable: false },
		upper: { value: upper, enumerable: true, configurable: false, writable: false },
	}) as T & TypedCheckedBounds;
};
