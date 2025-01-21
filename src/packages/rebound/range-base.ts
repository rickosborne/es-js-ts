import type { Comparator } from "@rickosborne/typical";
import { type RangeLike, unbounded, type Unbounded } from "./range-like.js";

export abstract class RangeBase<T> implements RangeLike<T> {
	public readonly isBounded: boolean;
	public readonly isBoundedAbove: boolean;
	public readonly isBoundedBelow: boolean;
	public readonly isEmpty: boolean;
	public readonly isSingleton: boolean;
	public readonly lowerEndpoint: T | undefined;
	public abstract readonly label: string;
	public readonly upperEndpoint: T | undefined;

	protected constructor(
		public readonly isLowerInc: boolean,
		public readonly lowerBound: T | Unbounded,
		public readonly upperBound: T | Unbounded,
		public readonly isUpperInc: boolean,
		public readonly comparator: Comparator<T>,
	) {
		if (lowerBound === unbounded && !isLowerInc) {
			throw new Error("Lower should be inclusive when unbounded");
		}
		if (upperBound === unbounded && !isUpperInc) {
			throw new Error("Upper should be inclusive when unbounded");
		}
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

	public compareTo(other: RangeLike<T>): number {
		if (this.lowerBound === unbounded) {
			if (other.lowerBound !== unbounded) return -1;
		} else if (other.lowerBound === unbounded) {
			return 1;
		} else {
			const lowerCompare = this.comparator(this.lowerBound, other.lowerBound);
			if (lowerCompare !== 0) {
				return lowerCompare;
			}
			if (this.isLowerInc && !other.isLowerInc) {
				return -1;
			} else if (other.isLowerInc && !this.isLowerInc) {
				return 1;
			}
		}
		if (this.upperBound === unbounded) {
			if (other.upperBound !== unbounded) return 1;
		} else if (other.upperBound === unbounded) {
			return -1;
		} else {
			const upperCompare = this.comparator(this.upperBound, other.upperBound);
			if (upperCompare !== 0) {
				return upperCompare;
			}
			if (this.isUpperInc && !other.isUpperInc) {
				return 1;
			} else if (other.isUpperInc && !this.isUpperInc) {
				return -1;
			}
		}
		return 0;
	}

	public contains(value: T): boolean {
		return (this.lowerBound === unbounded || (this.isLowerInc ? (this.comparator(value, this.lowerBound) >= 0) : (this.comparator(value, this.lowerBound) > 0)))
			&& (this.upperBound === unbounded || (this.isUpperInc ? (this.comparator(value, this.upperBound) <= 0) : (this.comparator(value, this.upperBound) < 0)));
	}

	public encloses(other: RangeLike<T>): boolean {
		if (other === this) {
			return true;
		}
		if (this.comparator !== other.comparator) {
			return false;
		}
		if (this.lowerBound === other.lowerBound) {
			if (!this.isLowerInc && other.isLowerInc) {
				return false;
			}
		} else if (other.lowerBound === unbounded) {
			if (this.lowerBound !== unbounded) {
				return false;
			}
		} else if (!this.contains(other.lowerBound)) {
			return false;
		}
		if (this.upperBound === other.upperBound) {
			if (!this.isUpperInc && other.isUpperInc) {
				return false;
			}
		} else if (other.upperBound === unbounded) {
			if (this.upperBound !== unbounded) {
				return false;
			}
		} else if (!this.contains(other.upperBound)) {
			return false;
		}
		return true;
	}

	public isA(obj: unknown): obj is T {
		return this.isType(obj) && this.contains(obj);
	}

	public abstract isType(obj: unknown): obj is T;

	public [ Symbol.toStringTag ](): string {
		return this.label;
	}

	public toString(): string {
		return this.label;
	}
}
