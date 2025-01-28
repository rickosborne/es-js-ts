import { numberAsc } from "@rickosborne/foundation";
import { RangeBase } from "./range-base.js";
import type { RangeLike } from "./range-like.js";
import { unbounded } from "./range-like.js";
import { rangeFromChecked } from "./range.js";
import type { CheckedBounds } from "./spec.js";

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
			numberAsc,
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
