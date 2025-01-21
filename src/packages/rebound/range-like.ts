import type { Comparator } from "@rickosborne/typical";

export const unbounded = Symbol.for("Unbounded");
export type Unbounded = typeof unbounded;

export interface RangeLike<T> {
	readonly comparator: Comparator<T>;
	readonly isBounded: boolean;
	readonly isBoundedAbove: boolean;
	readonly isBoundedBelow: boolean;
	readonly isEmpty: boolean;
	readonly isLowerInc: boolean;
	readonly isSingleton: boolean;
	readonly isUpperInc: boolean;
	readonly label: string;
	readonly lowerBound: T | Unbounded;
	readonly lowerEndpoint: T | undefined;
	readonly upperBound: T | Unbounded;
	readonly upperEndpoint: T | undefined;
}
