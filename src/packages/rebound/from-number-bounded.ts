import { lowerFirst } from "@rickosborne/foundation";
import { scrubStackTrace } from "@rickosborne/guard";
import type { GuardExact, If } from "./guard-bounded.js";
import type { OutOfBoundsErrorProvider, TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface FromNumber<N extends number> extends TypedCheckedBounds {
	(this: void, value: number, name?: string | undefined): N;
}

export interface FromNumberIfPresent<N extends number> extends FromNumber<N> {
	(this: void, value: number | undefined | null, name?: string | undefined): N | undefined;
}

export function boundedFromNumber<N extends number, IfPresent extends boolean>(
	guard: GuardExact<N>,
	errorProvider: OutOfBoundsErrorProvider,
	ifPresent: IfPresent,
	value: number | undefined | null,
	name?: string | undefined,
): If<IfPresent, N | undefined, N> {
	if (value != null && guard(value)) {
		return value;
	}
	if (value == null && ifPresent) {
		return undefined as If<IfPresent, N | undefined, N>;
	}
	const error = errorProvider(value, name);
	throw scrubStackTrace(error, "boundedFromNumber");
}

export function fromNumberForBounds<N extends number, IfPresent extends boolean>(
	guard: GuardExact<N>,
	errorProvider: OutOfBoundsErrorProvider,
	ifPresent: IfPresent,
	fnName: string = `${ lowerFirst(guard.typeName) }FromNumber${ ifPresent ? "IfPresent" : "" }`,
): If<IfPresent, FromNumberIfPresent<N>, FromNumber<N>> {
	return addTypedProperties(
		boundedFromNumber.bind(undefined, guard, errorProvider, ifPresent),
		guard,
		guard.typeName,
		fnName,
	) as If<IfPresent, FromNumberIfPresent<N>, FromNumber<N>>;
}
