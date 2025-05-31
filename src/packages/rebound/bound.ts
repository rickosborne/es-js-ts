import { numberAsc, stringAsc } from "@rickosborne/foundation";
import type { Comparator } from "@rickosborne/typical";
import { A_GT_B, A_LT_B } from "@rickosborne/typical";
import type { Unbounded } from "./range-like.js";
import { unbounded } from "./range-like.js";

export const BOUND_GT = ">";
export const BOUND_GTE = ">=";
export const BOUND_LT = "<";
export const BOUND_LTE = "<=";

export type BoundType = typeof BOUND_GT | typeof BOUND_GTE | typeof BOUND_LT | typeof BOUND_LTE;
export const BOUND_TYPES: Readonly<BoundType[]> = Object.freeze([ BOUND_LT, BOUND_LTE, BOUND_GTE, BOUND_GT ]);

export const boundTypeComparator: Comparator<BoundType> = (a: BoundType, b: BoundType): number => {
	if (a === b) {
		return 0;
	}
	return BOUND_TYPES.indexOf(a) - BOUND_TYPES.indexOf(b);
};

export const boundTypeComparisonIsValid: Readonly<Record<BoundType, (comparison: number) => boolean>> = Object.freeze({
	[ BOUND_GT ]: (c: number) => c > 0,
	[ BOUND_GTE ]: (c: number) => c >= 0,
	[ BOUND_LT ]: (c: number) => c < 0,
	[ BOUND_LTE ]: (c: number) => c <= 0,
});

export const boundComparator = <T>(a: Bound<T> | Unbounded, b: Bound<T> | Unbounded): number => {
	if (a === b) {
		return 0;
	}
	if (a === unbounded) {
		if ((b as Bound<T>).boundType === BOUND_GT || (b as Bound<T>).boundType === BOUND_GTE) {
			return A_LT_B;
		}
		return A_GT_B;
	}
	if (b === unbounded) {
		if (a.boundType === BOUND_GT || a.boundType === BOUND_GTE) {
			return A_GT_B;
		}
		return A_LT_B;
	}
	if (a.comparator !== b.comparator) {
		throw new Error(`Mismatched comparators: ${ a.comparator.name } ${ b.comparator.name }`);
	}
	const valueComparison = a.comparator(a.value, b.value);
	if (valueComparison !== 0) {
		return valueComparison;
	}
	return boundTypeComparator(a.boundType, b.boundType);
};

export class Bound<T> {
	public static gt<N extends number>(value: number): Bound<N>;

	public static gt<S extends string>(value: string): Bound<S>;

	public static gt<U>(value: U, comparator: Comparator<U>): Bound<U>;

	public static gt<U>(value: U, comparator?: Comparator<U>): Bound<U> {
		const cmp: Comparator<U> | undefined = comparator ?? (typeof value === "number" ? numberAsc as Comparator<U> : typeof value === "string" ? stringAsc as Comparator<U> : undefined);
		if (cmp == null) {
			throw new Error("Comparator required");
		}
		return new Bound<U>(value, BOUND_GT, cmp);
	}

	public static gte<N extends number>(value: number): Bound<N>;

	public static gte<S extends string>(value: string): Bound<S>;

	public static gte<U>(value: U, comparator: Comparator<U>): Bound<U>;

	public static gte<U>(value: U, comparator?: Comparator<U>): Bound<U> {
		const cmp: Comparator<U> | undefined = comparator ?? (typeof value === "number" ? numberAsc as Comparator<U> : typeof value === "string" ? stringAsc as Comparator<U> : undefined);
		if (cmp == null) {
			throw new Error("Comparator required");
		}
		return new Bound<U>(value, BOUND_GTE, cmp);
	}

	public static lt<N extends number>(value: number): Bound<N>;

	public static lt<S extends string>(value: string): Bound<S>;

	public static lt<U>(value: U, comparator: Comparator<U>): Bound<U>;

	public static lt<U>(value: U, comparator?: Comparator<U>): Bound<U> {
		const cmp: Comparator<U> | undefined = comparator ?? (typeof value === "number" ? numberAsc as Comparator<U> : typeof value === "string" ? stringAsc as Comparator<U> : undefined);
		if (cmp == null) {
			throw new Error("Comparator required");
		}
		return new Bound<U>(value, BOUND_LT, cmp);
	}

	public static lte<N extends number>(value: number): Bound<N>;

	public static lte<S extends string>(value: string): Bound<S>;

	public static lte<U>(value: U, comparator: Comparator<U>): Bound<U>;

	public static lte<U>(value: U, comparator?: Comparator<U>): Bound<U> {
		const cmp: Comparator<U> | undefined = comparator ?? (typeof value === "number" ? numberAsc as Comparator<U> : typeof value === "string" ? stringAsc as Comparator<U> : undefined);
		if (cmp == null) {
			throw new Error("Comparator required");
		}
		return new Bound<U>(value, BOUND_LTE, cmp);
	}

	public readonly boundType: BoundType;
	public readonly comparator: Comparator<T>;
	public readonly isInc: boolean;
	private readonly validator: (comparison: number) => boolean;
	public readonly value: T;

	protected constructor(value: T, boundType: BoundType, comparator: Comparator<T>) {
		this.value = value;
		this.boundType = boundType;
		this.comparator = comparator;
		this.isInc = boundType === BOUND_LTE || boundType === BOUND_GTE;
		this.validator = boundTypeComparisonIsValid[ boundType ];
	}

	public compareTo(other: Bound<T> | Unbounded): number {
		return boundComparator(this, other);
	}

	public isValid(value: T): boolean {
		const comparison = this.comparator(value, this.value);
		return this.validator(comparison);
	}

	public toString(): string {
		return this.boundType.concat(String(this.value));
	}
}
