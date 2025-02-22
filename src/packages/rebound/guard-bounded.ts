import { isInt as isIntValue } from "@rickosborne/guard";
import type { ReboundedFromChecked, TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface GuardExact<T extends number> extends TypedCheckedBounds {
	(this: void, value: unknown): value is T;
}

export interface GuardIfPresent<T extends number> extends TypedCheckedBounds {
	(this: void, value: unknown): value is T | undefined | null;
}

export type IfIfPresent<IfPresent extends boolean, T> = IfPresent extends true ? (T | null | undefined) : T;
export type If<IfPresent extends boolean | undefined, T, U> = IfPresent extends true ? T : U;

export const validateBounded = <IsLowerInc extends boolean, Lower extends number, IsInt extends boolean, Upper extends number, IsUpperInc extends boolean, IfPresent extends boolean>(
	isLowerInc: IsLowerInc,
	lower: Lower,
	isInt: IsInt,
	upper: Upper,
	isUpperInc: IsUpperInc,
	ifPresent: IfPresent,
	value: unknown,
): value is IfIfPresent<IfPresent, number & ReboundedFromChecked<IsLowerInc, Lower, IsInt, Upper, IsUpperInc>> => {
	return (ifPresent && value == null) ||
		((typeof value === "number") &&
			!isNaN(value) &&
			(isLowerInc ? (value >= lower) : (value > lower)) &&
			(isUpperInc ? (value <= upper) : (value < upper)) &&
			(!isInt || isIntValue(value)));
};

/**
 * Generate a guard for the branded number type matching the given spec.
 */
export function guardForBounds<Bounds extends Omit<TypedCheckedBounds, "typeName">, N extends number, IfPresent extends boolean>(
	bounds: Bounds,
	typeName: string,
	fnName: string,
	ifPresent: IfPresent,
): If<IfPresent, GuardIfPresent<N>, GuardExact<N>> {
	const { isInt, isUpperInc, isLowerInc, lower, upper } = bounds;
	const fn = fnName ?? `is${ typeName }${ ifPresent ? "IfPresent" : "" }`;
	const guard = validateBounded.bind(undefined, isLowerInc, lower, isInt, upper, isUpperInc, ifPresent);
	return addTypedProperties(guard, bounds, typeName, fn) as If<IfPresent, GuardIfPresent<N>, GuardExact<N>>;
}
