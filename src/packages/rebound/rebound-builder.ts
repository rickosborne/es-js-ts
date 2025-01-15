
import { Rebound } from "./rebound.js";
import { type BoundsConfig, type BoundsLabel, INT_SET, type IntegerSet, LOWER_EX, LOWER_IN, type LowerExclusive, type LowerInclusive, type LowerInEx, type LowerInExFrom, type NegInfinity, type NumberSet, type NumberSetFrom, type PosInfinity, REAL_SET, type RealSet, UPPER_EX, UPPER_IN, type UpperExclusive, type UpperInclusive, type UpperInEx, type UpperInExFrom } from "./spec.js";

type IsCompleteConfig<
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> = number extends Lower ? false : number extends Upper ? false : NumberSet extends Int ? false : LowerInEx extends LowerInc ? false : UpperInEx extends UpperInc ? false : true;

export type ReboundConfigBuilder<
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> = {
	readonly config: BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>;
} & IsCompleteConfig<LowerInc, Lower, Int, Upper, UpperInc> extends true ? {
	build(): Rebound<BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>, LowerInc, Lower, Int, Upper, UpperInc>;
} : ((number extends Lower ? {
	fromExclusive<L extends number>(value: L): ReboundConfigBuilder<LowerExclusive, L, Int, Upper, UpperInc>;
	fromInclusive<L extends number>(value: L): ReboundConfigBuilder<LowerInclusive, L, Int, Upper, UpperInc>;
	fromNegInfinity<LI extends boolean>(inclusive: LI): ReboundConfigBuilder<LowerInExFrom<LI>, NegInfinity, Int, Upper, UpperInc>;
	fromValue<L extends number, LI extends boolean>(value: L, inclusive: LI): ReboundConfigBuilder<LowerInExFrom<LI>, L, Int, Upper, UpperInc>;
} : object) & (NumberSet extends Int ? {
	intOnly<IR extends boolean>(int: IR): ReboundConfigBuilder<LowerInc, Lower, NumberSetFrom<IR>, Upper, UpperInc>;
	integers(): ReboundConfigBuilder<LowerInc, Lower, IntegerSet, Upper, UpperInc>;
	reals(): ReboundConfigBuilder<LowerInc, Lower, RealSet, Upper, UpperInc>;
} : object) & (number extends Upper ? {
	toExclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperExclusive>;
	toInclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInclusive>;
	toPosInfinity<UI extends boolean>(inclusive: UI): ReboundConfigBuilder<LowerInc, Lower, Int, PosInfinity, UpperInExFrom<UI>>;
	toValue<U extends number, UI extends boolean>(value: U, inclusive: UI): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInExFrom<UI>>;
} : object));

export function checkMissing<Lower extends number, LowerInc extends LowerInEx, Int extends NumberSet, UpperInc extends UpperInEx, Upper extends number>(config: Partial<BoundsConfig<LowerInEx, number, NumberSet, number, UpperInEx>>): asserts config is BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc> {
	const missing: string[] = [];
	if (config.lower == null || config.lowerInc == null) {
		missing.push("Lower bound");
	}
	if (config.int == null) {
		missing.push("Int/Real");
	}
	if (config.upper == null && config.upperInc == null) {
		missing.push("Upper bound");
	}
	if (missing.length > 0) {
		throw new Error(`Missing configuration: ${ missing.join(", ") }`);
	}
}

export class ReboundBuilder<
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> {
	constructor(
		private readonly config: BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>,
		private readonly toRebound: <BWR extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>(config: BWR) => Rebound<BoundsLabel<BWR>, LowerInc, Lower, Int, Upper, UpperInc>,
	) {
	}

	public build(): Rebound<BoundsLabel<typeof this.config>, LowerInc, Lower, Int, Upper, UpperInc> {
		checkMissing(this.config);
		return this.toRebound(this.config);
	}

	public fromExclusive<L extends number>(value: L): ReboundConfigBuilder<LowerExclusive, L, Int, Upper, UpperInc> {
		this.setLower(value, LOWER_EX);
		return this;
	}

	public fromInclusive<L extends number>(value: L): ReboundConfigBuilder<LowerInclusive, L, Int, Upper, UpperInc> {
		this.setLower(value, LOWER_IN);
		return this;
	}

	public fromNegInfinity<LI extends boolean>(inclusive: LI): ReboundConfigBuilder<LowerInExFrom<LI>, NegInfinity, Int, Upper, UpperInc> {
		const lowerInc = (inclusive ? LOWER_IN : LOWER_EX) satisfies LowerInEx as LowerInExFrom<LI>;
		this.setLower(-Infinity as NegInfinity, lowerInc);
		return this;
	}

	public fromValue<L extends number, LI extends boolean>(lower: L, inclusive: LI): ReboundConfigBuilder<LowerInExFrom<LI>, L, Int, Upper, UpperInc> {
		const lowerInc = (inclusive ? LOWER_IN : LOWER_EX) satisfies LowerInEx as LowerInExFrom<LI>;
		this.setLower(lower, lowerInc);
		return this;
	}

	public intOnly<IR extends boolean>(intOnly: IR): ReboundConfigBuilder<LowerInc, Lower, NumberSetFrom<IR>, Upper, UpperInc> {
		const int = (intOnly ? INT_SET : REAL_SET) satisfies NumberSet as NumberSetFrom<IR>;
		this.setIntReal(int);
		return this;
	}

	public integers(): ReboundConfigBuilder<LowerInc, Lower, IntegerSet, Upper, UpperInc> {
		this.setIntReal(INT_SET);
		return this;
	}

	public reals(): ReboundConfigBuilder<LowerInc, Lower, RealSet, Upper, UpperInc> {
		this.setIntReal(REAL_SET);
		return this;
	}

	protected setIntReal<IR extends NumberSet>(int: IR): asserts this is ReboundConfigBuilder<LowerInc, Lower, IR, Upper, UpperInc> {
		(this.config.int as unknown as NumberSet) = int;
	}

	protected setLower<L extends number, LI extends LowerInEx>(lower: L, lowerInc: LI): asserts this is ReboundConfigBuilder<LI, L, Int, Upper, UpperInc> {
		if (Number.isNaN(lower)) {
			throw new Error("Lower bound cannot be NaN");
		}
		if (lower === Infinity) {
			throw new Error("Use -Infinity for a lower bound.");
		}
		(this.config.lower as unknown as L) = lower;
		(this.config.lowerInc as unknown as LowerInEx) = lowerInc;
	}

	protected setUpper<U extends number, UI extends UpperInEx>(upper: U, upperInc: UI): asserts this is ReboundConfigBuilder<LowerInc, Lower, Int, U, UI> {
		if (Number.isNaN(upper)) {
			throw new Error("Upper bound cannot be NaN");
		}
		if (upper === -Infinity) {
			throw new Error("Use Infinity for an upper bound.");
		}
		(this.config.upper as unknown as U) = upper;
		(this.config.upperInc as unknown as UpperInEx) = upperInc;
	}

	public toExclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperExclusive> {
		this.setUpper(value, UPPER_EX);
		return this;
	}

	public toInclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInclusive> {
		this.setUpper(value, UPPER_IN);
		return this;
	}

	public toPosInfinity<UI extends boolean>(inclusive: UI): ReboundConfigBuilder<LowerInc, Lower, Int, PosInfinity, UpperInExFrom<UI>> {
		const upperInc = (inclusive ? UPPER_IN : UPPER_EX) satisfies UpperInEx as UpperInExFrom<UI>;
		this.setUpper(Infinity as PosInfinity, upperInc);
		return this;
	}

	public toValue<U extends number, UI extends boolean>(value: U, inclusive: UI): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInExFrom<UI>> {
		const upperInc = (inclusive ? UPPER_IN : UPPER_EX) satisfies UpperInEx as UpperInExFrom<UI>;
		this.setUpper(value, upperInc);
		return this;
	}
}
