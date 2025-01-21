import { con, lowerFirst } from "@rickosborne/foundation";
import { effectiveRange } from "./effective-range.js";
import type { If } from "./guard-bounded.js";
import type { TypedCheckedBounds } from "./spec.js";
import { addTypedProperties } from "./typed-function.js";

export interface ScaleExact<Input extends number, Output extends number> extends TypedCheckedBounds {
	(this: void, value: Input): Output;
}

export interface ScaleIfPresent<Input extends number, Output extends number> extends TypedCheckedBounds {
	(this: void, value: Input): Output;

	(this: void, value: null | undefined): undefined;

	(this: void, value: Input | null | undefined): Output | undefined;
}

export const scaleBounded = <Input extends number, Output extends number, IfPresent extends boolean>(
	inputBounds: TypedCheckedBounds,
	outputBounds: TypedCheckedBounds,
	ifPresent: IfPresent,
	fnName: string = `${ lowerFirst(outputBounds.typeName) }From${ inputBounds.typeName }`,
): If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>> => {
	const inputRange = effectiveRange(inputBounds);
	if (inputRange === 0) {
		throw new RangeError("Input range must be > 0");
	}
	const outputRange = effectiveRange(outputBounds);
	const inputShift = inputBounds.lower + (inputBounds.isLowerInc ? 0 : inputBounds.isInt ? 1 : Number.MIN_VALUE) as Input;
	const outputShift = outputBounds.lower + (outputBounds.isLowerInc ? 0 : outputBounds.isInt ? 1 : Number.MIN_VALUE) as Output;
	if (outputRange === 0) {
		con.warn("Effective output range is 0.  All outputs will be the same.");
		if (ifPresent) {
			return ((value: unknown) => value == null ? undefined : outputShift) as If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>>;
		} else {
			return (() => outputShift) as unknown as If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>>;
		}
	}
	const factor = outputRange / inputRange;
	let convert: (input: Input) => Output;
	if (outputBounds.isInt) {
		convert = (input) => Math.trunc(((input - inputShift) * factor) + outputShift) as Output;
	} else {
		convert = (input) => (((input - inputShift) * factor) + outputShift) as Output;
	}
	let fn: If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>>;
	if (ifPresent) {
		fn = ((input: Input | undefined): Output | undefined => input == null ? undefined : convert(input)) as If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>>;
	} else {
		fn = convert as If<IfPresent, ScaleIfPresent<Input, Output>, ScaleExact<Input, Output>>;
	}
	return addTypedProperties(fn, outputBounds, outputBounds.typeName, fnName);
};
