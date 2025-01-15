import { scrubStackTrace } from "@rickosborne/guard";
import type { GuardExact, GuardIfPresent, If, IfIfPresent } from "./guard-bounded.js";
import type { OutOfBoundsErrorProvider, TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface AssertExact<N extends number> extends TypedCheckedBounds {
	(this: void, value: unknown, name?: string | undefined): asserts value is N;
}

export interface AssertIfPresent<N extends number> extends TypedCheckedBounds {
	(this: void, value: unknown, name?: string | undefined): asserts value is N | null | undefined;
}

export function assertBounded<N extends number, IfPresent extends boolean>(
	guard: If<IfPresent,GuardIfPresent<N>,GuardExact<N>>,
	errorProvider: OutOfBoundsErrorProvider,
	ifPresent: IfPresent,
	value: unknown,
	name?: string | undefined,
): asserts value is IfIfPresent<IfPresent, N> {
	if ((value == null && !ifPresent) || !guard(value)) {
		const error = errorProvider(value, name);
		throw scrubStackTrace(error, "assertBounded");
	}
}

export function assertForBounds<N extends number, IfPresent extends boolean>(
	guard: If<IfPresent, GuardIfPresent<N>, GuardExact<N>>,
	errorProvider: OutOfBoundsErrorProvider,
	ifPresent: IfPresent,
	fnName: string = `assert${ guard.typeName }${ ifPresent ? "IfPresent" : "" }`,
): If<IfPresent, AssertIfPresent<N>, AssertExact<N>> {
	return addTypedProperties(
		assertBounded.bind(undefined, guard, errorProvider, ifPresent),
		guard,
		guard.typeName,
		fnName,
	);
}
