import { RangeBase } from "./range-base.js";
import type { RangeLike } from "./range-like.js";

export class EmptyRange extends RangeBase<never> {
	public override readonly isEmpty = true;
	public override readonly isSingleton = true;
	public override readonly label = "<empty>";

	public override contains(): boolean {
		return false;
	}

	public override encloses(other: RangeLike<never>): boolean {
		if (!other.isEmpty) {
			return false;
		}
		return super.encloses(other);
	}

	public isType(_obj: never): _obj is never {
		return false;
	}
}
