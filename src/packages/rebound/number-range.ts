import type { Comparator } from "@rickosborne/typical";
import { RangeBase } from "./range-base.js";
import { type RangeLike, unbounded } from "./range-like.js";
import { rangeFromChecked } from "./range.js";
import type { CheckedBounds } from "./spec.js";

export const numberComparator: Comparator<number> = (a, b) => a - b;

export abstract class NumberRange extends RangeBase<number> implements CheckedBounds, RangeLike<number> {
	public abstract readonly discreteIntegers: number | undefined;
	public override readonly isEmpty: boolean;
	public override readonly isSingleton: boolean;
	public readonly label: string;
	public abstract readonly step: number;

	protected constructor(
		isLowerInc: boolean,
		public readonly lower: number,
		public isInt: boolean,
		public readonly upper: number,
		isUpperInc: boolean,
	) {
		if ((!Number.isFinite(lower) && !isLowerInc) || (!Number.isFinite(upper) && !isUpperInc)) {
			throw new RangeError(`Unbounded (infinite) upper/lower must be inclusive`);
		}
		let isSingleton = false;
		let isEmpty = false;
		if (lower > upper) {
			throw new RangeError("Expected lower <= upper");
		}
		if (lower === upper) {
			if (!isLowerInc && !isUpperInc) {
				throw new Error("Expected at least one inclusive when lower === upper");
			}
			isSingleton = isLowerInc && isUpperInc;
			isEmpty = !isSingleton;
		}
		super(
			isLowerInc,
			Number.isFinite(lower) ? lower : unbounded,
			Number.isFinite(upper) ? upper : unbounded,
			isUpperInc,
			numberComparator,
		);
		this.isSingleton = isSingleton;
		this.isEmpty = isEmpty;
		this.label = rangeFromChecked({ isInt, isLowerInc, isUpperInc, lower, upper });
	}

	protected assertCanScaleFrom(other: NumberRange): void {
		if (!this.isBounded || !other.isBounded) {
			throw new RangeError("Cannot scale with unbounded range");
		}
		if (other.lower >= other.upper) {
			throw new RangeError("Not enough source range");
		}
	}

	public override compareTo(other: RangeLike<number>): number {
		const compared = super.compareTo(other);
		if (compared !== 0) {
			return compared;
		}
		if (other instanceof NumberRange) {
			if (this.isInt && !other.isInt) {
				return -1;
			} else if (!this.isInt && other.isInt) {
				return 1;
			}
		}
		return 0;
	}

	public override contains(value: number): boolean {
		return (this.lowerBound === unbounded || (this.isLowerInc ? (value >= this.lowerBound) : (value > this.lowerBound)))
			&& (this.upperBound === unbounded || (this.isUpperInc ? (value <= this.upperBound) : (value < this.upperBound)));
	}

	public override encloses(other: RangeLike<number>): boolean {
		if (other instanceof NumberRange && this.step > other.step) {
			return false;
		}
		return super.encloses(other);
	}

	public override isType(obj: unknown): obj is number {
		return typeof obj === "number" && !Number.isNaN(obj);
	}

	public abstract scaleValueFrom(value: number, other: NumberRange): number;
}

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
			const percent = (value - other.lower) / divisor;
			return this.lower + inset + (percent * divisor);
		}
		if (this.isLowerInc !== other.isLowerInc || this.isUpperInc !== other.isUpperInc) {
			throw new RangeError("Incompatible bounds for scaling");
		}
		const factor = (this.upper - this.lower) / (other.upper - other.lower);
		return ((value - other.lower) * factor) + this.lower;
	}
}
