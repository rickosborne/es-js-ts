import { IntegerRange } from "./integer-range.js";
import type { NumberRange } from "./number-range.js";
import { RealRange } from "./real-range.js";
import type { Rebound } from "./rebound.js";
import type { BoundedNumber, BoundsConfig, IntegerSet, LowerExclusive, LowerInclusive, LowerInEx, LowerInExFrom, NegInfinity, NumberSet, NumberSetFrom, PosInfinity, RealSet, UpperExclusive, UpperInclusive, UpperInEx, UpperInExFrom } from "./spec.js";
import { INT_SET, LOWER_EX, LOWER_IN, REAL_SET, UPPER_EX, UPPER_IN } from "./spec.js";

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
	build(): Rebound<BoundedNumber<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>>;
} : ((number extends Lower ? {
	fromExclusive<L extends number>(value: L): ReboundConfigBuilder<LowerExclusive, L, Int, Upper, UpperInc>;
	fromInclusive<L extends number>(value: L): ReboundConfigBuilder<LowerInclusive, L, Int, Upper, UpperInc>;
	fromNegInfinity(): ReboundConfigBuilder<LowerInExFrom<true>, NegInfinity, Int, Upper, UpperInc>;
	fromValue<L extends number, LI extends boolean>(value: L, inclusive: LI): ReboundConfigBuilder<LowerInExFrom<LI>, L, Int, Upper, UpperInc>;
} : object) & (NumberSet extends Int ? {
	intOnly<IR extends boolean>(int: IR): ReboundConfigBuilder<LowerInc, Lower, NumberSetFrom<IR>, Upper, UpperInc>;
	integers(): ReboundConfigBuilder<LowerInc, Lower, IntegerSet, Upper, UpperInc>;
	reals(): ReboundConfigBuilder<LowerInc, Lower, RealSet, Upper, UpperInc>;
} : object) & (number extends Upper ? {
	toExclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperExclusive>;
	toInclusive<U extends number>(value: U): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInclusive>;
	toPosInfinity(): ReboundConfigBuilder<LowerInc, Lower, Int, PosInfinity, UpperInExFrom<true>>;
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
		private readonly toRebound: <Config extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>(config: Config, range: NumberRange) => Rebound<BoundedNumber<Config>>,
	) {
	}

	public build(): Rebound<BoundedNumber<typeof this.config>> {
		checkMissing(this.config);
		let range: NumberRange;
		if (this.config.int === INT_SET) {
			range = new IntegerRange(this.config.lower, this.config.upper);
		} else {
			range = new RealRange(this.config.lowerInc === LOWER_IN, this.config.lower, this.config.upper, this.config.upperInc === UPPER_IN);
		}
		return this.toRebound(this.config, range);
	}

	public fromExclusive<L extends number>(value: L): ReboundConfigBuilder<LowerExclusive, L, Int, Upper, UpperInc> {
		this.setLower(value, LOWER_EX);
		return this;
	}

	public fromInclusive<L extends number>(value: L): ReboundConfigBuilder<LowerInclusive, L, Int, Upper, UpperInc> {
		this.setLower(value, LOWER_IN);
		return this;
	}

	public fromNegInfinity(): ReboundConfigBuilder<LowerInExFrom<true>, NegInfinity, Int, Upper, UpperInc> {
		this.setLower(-Infinity as NegInfinity, LOWER_IN);
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
		if (int === INT_SET && ((this.config.lowerInc != null && this.config.lowerInc === LOWER_EX) || (this.config.upperInc != null && this.config.upperInc === UPPER_EX))) {
			throw new Error("Integer ranges must have inclusive bounds");
		}
		(this.config.int as unknown as NumberSet) = int;
	}

	protected setLower<L extends number, LI extends LowerInEx>(lower: L, lowerInc: LI): asserts this is ReboundConfigBuilder<LI, L, Int, Upper, UpperInc> {
		if (Number.isNaN(lower)) {
			throw new Error("Bound cannot be NaN");
		}
		if (lower === Infinity) {
			throw new Error("Use -Infinity for a lower bound");
		}
		if (this.config.upper != null && lower > this.config.upper) {
			throw new Error("Bounds are reversed");
		}
		if (lowerInc === LOWER_EX && this.config.int == INT_SET) {
			throw new Error("Integer bounds must be inclusive");
		}
		(this.config.lower as unknown as L) = lower;
		(this.config.lowerInc as unknown as LowerInEx) = lowerInc;
	}

	protected setUpper<U extends number, UI extends UpperInEx>(upper: U, upperInc: UI): asserts this is ReboundConfigBuilder<LowerInc, Lower, Int, U, UI> {
		if (Number.isNaN(upper)) {
			throw new Error("Bound cannot be NaN");
		}
		if (upper === -Infinity) {
			throw new Error("Use Infinity for an upper bound");
		}
		if (this.config.lower != null && upper < this.config.lower) {
			throw new Error("Bounds are reversed");
		}
		if (upperInc === UPPER_EX && this.config.int == INT_SET) {
			throw new Error("Integer bounds must be inclusive");
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

	public toPosInfinity(): ReboundConfigBuilder<LowerInc, Lower, Int, PosInfinity, UpperInExFrom<true>> {
		this.setUpper(Infinity as PosInfinity, UPPER_IN);
		return this;
	}

	public toValue<U extends number, UI extends boolean>(value: U, inclusive: UI): ReboundConfigBuilder<LowerInc, Lower, Int, U, UpperInExFrom<UI>> {
		const upperInc = (inclusive ? UPPER_IN : UPPER_EX) satisfies UpperInEx as UpperInExFrom<UI>;
		this.setUpper(value, upperInc);
		return this;
	}
}
