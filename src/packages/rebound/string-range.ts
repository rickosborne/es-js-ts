import type { Comparator } from "@rickosborne/typical";
import { RangeBase } from "./range-base.js";
import type { Unbounded } from "./range-like.js";
import { unbounded } from "./range-like.js";

const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b);

export class StringRange extends RangeBase<string> {
    public override label: string;

	constructor(
		isLowerInc: boolean,
		lower: string | Unbounded,
		upper: string | Unbounded,
		isUpperInc: boolean,
	) {
		super(isLowerInc, lower, upper, isUpperInc, stringComparator);
		this.label = lower === unbounded && upper === unbounded ? "<string>" : `${isLowerInc ? "[" : "("}${lower === unbounded ? "" : lower}${this.upperBound === this.lowerBound ? "" : `..${upper === unbounded ? "" : upper }`}${isUpperInc ? "]" : ")"}`;
	}

	public isType(obj: unknown): obj is string {
		return typeof obj === "string";
	}
}
