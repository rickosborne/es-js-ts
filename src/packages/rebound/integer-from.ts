import { lowerFirst } from "@rickosborne/foundation";
import { scrubStackTrace } from "@rickosborne/guard";
import type { If } from "./guard-bounded.js";
import type { CheckedBoundsConfig, OutOfBoundsErrorProvider, TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface ConvertTo<N extends number> extends TypedCheckedBounds {
	(this: void, value: number, name?: string | undefined): N;
}

export interface ConvertIfPresentTo<N extends number> extends ConvertTo<N> {
	(this: void, value: number | undefined | null, name?: string | undefined): N | undefined;
}

export type ToInt<N> = (this: void, value: number, name?: string | undefined) => N;
export const ROUND = "round";
export const CEIL = "ceil";
export const TRUNC = "trunc";
export const FLOOR = "floor";
export type IntStrategy = typeof ROUND | typeof CEIL | typeof TRUNC | typeof FLOOR | ((value: number) => number);

export function boundedIntFromNumber<N extends number, IsLowerInc extends boolean, Lower extends number, Upper extends number, IsUpperInc extends boolean, IfPresent extends boolean>(
	isLowerInc: IsLowerInc,
	lower: Lower,
	upper: Upper,
	isUpperInc: IsUpperInc,
	ifPresent: IfPresent,
	errorProvider: OutOfBoundsErrorProvider,
	strategy: ToInt<N>,
	value: number | undefined | null,
	name?: string | undefined,
): If<IfPresent, N | undefined, N> {
	if (value != null && (isLowerInc ? (value >= lower) : (value > lower)) && (isUpperInc ? (value <= upper) : (value < upper))) {
		return strategy(value);
	}
	if (value == null && ifPresent) {
		return undefined as If<IfPresent, N | undefined, N>;
	}
	const error = errorProvider(value, name);
	throw scrubStackTrace(error, "boundedIntFromNumber");
}

export function integerFrom<N extends number, IsLowerInc extends boolean, Lower extends number, Upper extends number, IsUpperInc extends boolean, IfPresent extends boolean>(
	typeName: string,
	bounds: CheckedBoundsConfig<IsLowerInc, Lower, boolean, Upper, IsUpperInc>,
	errorProvider: OutOfBoundsErrorProvider,
	ifPresent: IfPresent,
	strategy: IntStrategy = ROUND,
	fnName: string = `${ lowerFirst(typeName) }From${ typeof strategy === "function" ? strategy.name : strategy }${ ifPresent ? "IfPresent" : "" }`,
): If<IfPresent, ConvertIfPresentTo<N>, ConvertTo<N>> {
	const toInt = (typeof strategy === "function" ? strategy : Math[ strategy ]) as ToInt<N>;
	const boundedIntFrom = boundedIntFromNumber.bind(undefined, bounds.isLowerInc, bounds.lower, bounds.upper, bounds.isUpperInc, ifPresent, errorProvider, toInt) as If<IfPresent, ConvertIfPresentTo<N>, ConvertTo<N>>;
	return addTypedProperties(boundedIntFrom, bounds, typeName, fnName);
}
