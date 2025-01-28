import { NumberRange } from "./number-range.js";

export class IntegerRange extends NumberRange {
	public readonly discreteIntegers: number;
	public override readonly step = 1;

	constructor(
		lower: number,
		upper: number,
	) {
		super(true, lower, true, upper, true);
		this.discreteIntegers = upper - lower + 1;
	}

	public override contains(value: number): boolean {
		return (Number.isSafeInteger(value) || !Number.isFinite(value)) && super.contains(value);
	}

	public override scaleValueFrom(value: number, other: NumberRange): number {
		super.assertCanScaleFrom(other);
		if (this.isSingleton) {
			return this.lower;
		}
		return Math.round((value - other.lower) * (this.upper - this.lower) / (other.upper - other.lower)) + this.lower;
	}
}
