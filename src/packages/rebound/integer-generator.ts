import { validateBounded } from "./guard-bounded.js";
import type { CheckedBounds } from "./spec.js";

export interface IntegerGeneratorOptions {
	end?: number | undefined
	start?: number | undefined;
	step?: number | undefined;
	typeName?: string | undefined;
}

export function* integerGenerator<N extends number>(
	bounds: CheckedBounds,
	options: IntegerGeneratorOptions = {},
): Generator<N, undefined, undefined> {
	const { isLowerInc, isUpperInc, isInt, upper, lower } = bounds;
	const prefix = options.typeName?.concat(": ") ?? "";
	const step = (options.step ?? 1) as N;
	const start = (options.start ?? (step < 0 ? upper : lower)) as N;
	const end = (options.end ?? (step < 0 ? lower : upper)) as N;
	if (!Number.isFinite(start)) {
		throw new RangeError(`${ prefix }Unbounded start`);
	}
	if (
		!validateBounded(isLowerInc, lower, isInt, upper, isUpperInc, false, start) ||
		!validateBounded(isLowerInc, lower, isInt, upper, isUpperInc, false, end) ||
		(step > 0 && start > end) ||
		(step < 0 && start < end)
	) {
		return;
	}
	let more: (n: number) => boolean;
	if (step > 0) {
		if (isUpperInc) more = (n) => n <= end;
		else more = (n) => n < end;
	} else if (step < 0) {
		if (isLowerInc) more = (n) => n >= end;
		else more = (n) => n > end;
	} else {
		more = () => true;
	}
	for (let n: N = start; more(n); n = (n + step) as N) {
		yield n;
	}
}
