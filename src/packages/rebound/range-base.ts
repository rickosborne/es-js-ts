import type { Comparator } from "@rickosborne/typical";
import { Bound, boundComparator } from "./bound.js";
import { unbounded } from "./range-like.js";
import type { RangeLike, Unbounded } from "./range-like.js";

export abstract class RangeBase<T> implements RangeLike<T> {
	public readonly comparator: Comparator<T>;
	public readonly isBounded: boolean;
	public readonly isBoundedAbove: boolean;
	public readonly isBoundedBelow: boolean;
	public readonly isEmpty: boolean;
	public readonly isLowerInc: boolean;
	public readonly isSingleton: boolean;
	public readonly isUpperInc: boolean;
	public abstract readonly label: string;
	public readonly lowerBound: Bound<T> | Unbounded;
	public readonly lowerEndpoint: T | undefined;
	public readonly upperBound: Bound<T> | Unbounded;
	public readonly upperEndpoint: T | undefined;

	protected constructor(
		isLowerInc: boolean,
		lowerBound: T | Unbounded,
		upperBound: T | Unbounded,
		isUpperInc: boolean,
		comparator: Comparator<T>,
	) {
		if (lowerBound === unbounded && !isLowerInc) {
			throw new Error("Lower should be inclusive when unbounded");
		}
		if (upperBound === unbounded && !isUpperInc) {
			throw new Error("Upper should be inclusive when unbounded");
		}
		this.comparator = comparator;
		this.lowerBound = lowerBound === unbounded ? unbounded : isLowerInc ? Bound.gte(lowerBound, comparator) : Bound.gt(lowerBound, comparator);
		this.upperBound = upperBound === unbounded ? unbounded : isUpperInc ? Bound.lte(upperBound, comparator) : Bound.lt(upperBound, comparator);
		this.isLowerInc = isLowerInc;
		this.isUpperInc = isUpperInc;
		this.isBoundedAbove = upperBound !== unbounded;
		this.isBoundedBelow = lowerBound !== unbounded;
		this.isBounded = this.isBoundedAbove && this.isBoundedBelow;
		if (lowerBound !== unbounded && upperBound !== unbounded && comparator(lowerBound, upperBound) === 0) {
			if (!isLowerInc && !isUpperInc) {
				throw new Error("Expected at least one inclusive when lower === upper");
			}
			this.isSingleton = isLowerInc && isUpperInc;
			this.isEmpty = !this.isSingleton;
		} else {
			this.isSingleton = false;
			this.isEmpty = false;
		}
		this.lowerEndpoint = lowerBound === unbounded ? undefined : lowerBound;
		this.upperEndpoint = upperBound === unbounded ? undefined : upperBound;
	}

	public assertIsA(obj: unknown): asserts obj is T {
		if (!this.isType(obj)) {
			throw new RangeError(`Incorrect type: ${ typeof obj }`);
		}
		if (!this.isA(obj)) {
			throw new RangeError(`Out of range: ${ String(obj) }`);
		}
	}

	public castAs(obj: unknown): T {
		this.assertIsA(obj);
		return obj;
	}

	public compareTo(other: RangeLike<T>): number {
		if (this.lowerBound === unbounded) {
			if (other.lowerBound !== unbounded) return -1;
		} else if (other.lowerBound === unbounded) {
			return 1;
		} else {
			const lowerCompare = this.lowerBound.compareTo(other.lowerBound);
			if (lowerCompare !== 0) {
				return lowerCompare;
			}
		}
		if (this.upperBound === unbounded) {
			if (other.upperBound !== unbounded) return 1;
		} else if (other.upperBound === unbounded) {
			return -1;
		} else {
			const upperCompare = this.upperBound.compareTo(other.upperBound);
			if (upperCompare !== 0) {
				return upperCompare;
			}
		}
		return 0;
	}

	public contains(value: T): boolean {
		return (this.lowerBound === unbounded || this.lowerBound.isValid(value))
			&& (this.upperBound === unbounded || this.upperBound.isValid(value));
	}

	public encloses(other: RangeLike<T>): boolean {
		if (other === this) {
			return true;
		}
		if (this.comparator !== other.comparator) {
			return false;
		}
		return boundComparator(this.lowerBound, other.lowerBound) <= 0
			&& boundComparator(this.upperBound, other.upperBound) >= 0;
	}

	public isA(obj: unknown): obj is T {
		return this.isType(obj) && this.contains(obj);
	}

	public abstract isType(obj: unknown): obj is T;

	public toString(): string {
		return this.label;
	}

	public [ Symbol.toStringTag ](): string {
		return this.label;
	}
}
