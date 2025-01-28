import { NumberRange } from "./number-range.js";

export class RealRange extends NumberRange {
	public readonly discreteIntegers = undefined;
	public override readonly step = Number.MIN_VALUE;

	constructor(
		isLowerInc: boolean,
		lower: number,
		upper: number,
		isUpperInc: boolean,
	) {
		super(isLowerInc, lower, false, upper, isUpperInc);
	}

	public override scaleValueFrom(value: number, other: NumberRange): number {
		if (this.isSingleton) {
			return this.isLowerInc ? this.lower : this.upper;
		}
		super.assertCanScaleFrom(other);
		if (other.discreteIntegers != null) {
			const units = other.discreteIntegers + (this.isLowerInc && this.isUpperInc ? -1 : 0);
			const divisor = (this.upper - this.lower) / units;
			const inset = this.isLowerInc ? 0 : this.isUpperInc ? divisor : (divisor / 2);
			const percent = (value - other.lower) / units;
			return this.lower + inset + (percent * (this.upper - this.lower));
		}
		if (this.isLowerInc !== other.isLowerInc || this.isUpperInc !== other.isUpperInc) {
			throw new RangeError(`Incompatible bounds for scaling: ${this.label} vs ${other.label}`);
		}
		const factor = (this.upper - this.lower) / (other.upper - other.lower);
		return ((value - other.lower) * factor) + this.lower;
	}
}
