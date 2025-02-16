export const BOUNDS = Symbol.for("bounds");
export type NegInfinityLabel = "-∞";
export type PosInfinityLabel = "+∞";
export type NegInfinity = number & { infinity: NegInfinityLabel };
export type PosInfinity = number & { infinity: PosInfinityLabel };
export type InfinityBound = number & { infinity: string };
export type LowerInclusive = "[";
export type LowerExclusive = "(";
export type UpperInclusive = "]";
export type UpperExclusive = ")";
export const LOWER_IN: LowerInclusive = "[";
export const LOWER_EX: LowerExclusive = "(";
export const UPPER_IN: UpperInclusive = "]";
export const UPPER_EX: UpperExclusive = ")";
export interface BoundIsInclusive {
	readonly [LOWER_IN]: true;
	readonly [LOWER_EX]: false;
	readonly [UPPER_IN]: true;
	readonly [UPPER_EX]: false;
}
export type UpperInEx = UpperInclusive | UpperExclusive;
export type LowerInEx = LowerInclusive | LowerExclusive;
export type LowerInExFrom<B extends boolean> = boolean extends B ? never : true extends B ? LowerInclusive : LowerExclusive;
// export type IsLowerIncFrom<LowerInc extends LowerInEx> = BoundIsInclusive[LowerInc];
export type UpperInExFrom<B extends boolean> = boolean extends B ? never : true extends B ? UpperInclusive : UpperExclusive;
// export type IsUpperIncFrom<UpperInc extends UpperInEx> = BoundIsInclusive[UpperInc];
export type IsInclusive<Inc extends UpperInEx | LowerInEx> = BoundIsInclusive[Inc]
export type IntegerSet = "int";
export type RealSet = "real";
export const INT_SET: IntegerSet = "int";
export const REAL_SET: RealSet = "real";
export type NumberSet = IntegerSet | RealSet;
export interface NumberSetIsInt {
	[INT_SET]: true;
	[REAL_SET]: false;
}
export type NumberSetFrom<B extends boolean> = boolean extends B ? never : true extends B ? IntegerSet : RealSet;
export type IsIntFrom<Int extends NumberSet> = NumberSetIsInt[Int];

export interface AnyBoundsConfig {
	int?: NumberSet | undefined;
	lower?: number | undefined;
	lowerInc?: LowerInEx | undefined;
	range?: string | undefined;
	upper?: number | undefined;
	upperInc?: UpperInEx | undefined;
}

export interface BoundsConfig<
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> extends AnyBoundsConfig {
	int: Int;
	lower: Lower;
	lowerInc: LowerInc;
	upper: Upper;
	upperInc: UpperInc;
}

export interface DefinedBounds {
	int: NumberSet;
	lower: number;
	lowerInc: LowerInEx;
	upper: number;
	upperInc: UpperInEx;
}

export interface CheckedBounds {
	isInt: boolean;
	isLowerInc: boolean;
	isUpperInc: boolean;
	lower: number;
	upper: number;
}

export interface DefinedFromChecked<
	IsLowerInc extends boolean,
	Lower extends number,
	IsInt extends boolean,
	Upper extends number,
	IsUpperInc extends boolean,
> extends DefinedBounds {
	int: NumberSetFrom<IsInt>;
	lower: Lower;
	lowerInc: LowerInExFrom<IsLowerInc>;
	upper: Upper;
	upperInc: UpperInExFrom<IsUpperInc>;
}

export interface DefinedFromCheckedConfig<Config extends CheckedBounds> extends DefinedFromChecked<Config["isLowerInc"], Config["lower"], Config["isInt"], Config["upper"], Config["isUpperInc"]> {}

export interface CheckedBoundsConfig<
	IsLowerInc extends boolean,
	Lower extends number,
	IsInt extends boolean,
	Upper extends number,
	IsUpperInc extends boolean,
> {
	isInt: IsInt;
	lower: Lower;
	isLowerInc: IsLowerInc;
	upper: Upper;
	isUpperInc: IsUpperInc;
}

export interface RangedBounds extends DefinedBounds {
	range: string;
}

export interface TypedBounds extends RangedBounds {
	typeName: string;
}

export interface TypedCheckedBounds extends CheckedBounds {
	label: string;
	typeName: string;
}

export const TYPED_BOUNDS_KEYS: (keyof TypedBounds)[] = [ "typeName", "range", "lowerInc", "lower", "int", "upper", "upperInc" ];
export const TYPED_CHECKED_BOUNDS_KEYS: (keyof TypedCheckedBounds)[] = [ "typeName", "label", "lower", "upper", "isInt", "isLowerInc", "isUpperInc" ];

export type BoundsLabel<C extends DefinedBounds> = `${
C extends { lowerInc: infer LowerInc extends LowerInEx } ? LowerInc : never
}${
C extends { lower: NegInfinity } ? NegInfinityLabel : C extends { lower: infer Lower extends number } ? number extends Lower ? never : `${ Lower }` : never
}${
C extends { int: infer Int extends NumberSet } ? Int extends IntegerSet ? ".." : "," : never
}${
C extends { upper: PosInfinity } ? PosInfinityLabel : C extends { upper: infer Upper extends number } ? number extends Upper ? never : `${ Upper }` : never
}${
C extends { upperInc: infer UpperInc extends UpperInEx } ? UpperInc : never
}`;

export interface BoundsWithRange<
	Range extends BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>,
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc> {
	range: Range;
}

/**
 * Nice, short, human-readable signature which will show up in the IDE.
 */
export interface Rebounded<
	Range extends BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>,
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> {
	[ BOUNDS ]: BoundsWithRange<Range, LowerInc, Lower, Int, Upper, UpperInc>;
}

export interface ReboundedFromConfig<
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> extends Rebounded<BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>, LowerInc, Lower, Int, Upper, UpperInc> {}

export interface ReboundedFromChecked<
	IsLowerInc extends boolean,
	Lower extends number,
	IsInt extends boolean,
	Upper extends number,
	IsUpperInc extends boolean,
> extends Rebounded<BoundsLabel<DefinedFromChecked<IsLowerInc, Lower, IsInt, Upper, IsUpperInc>>, LowerInExFrom<IsLowerInc>, Lower, NumberSetFrom<IsInt>, Upper, UpperInExFrom<IsUpperInc>> {}

/**
 * Brand a number type with a type-generated explanation of its bounds,
 * so that it can only accept other numbers with the exact same bounds.
 */
export type BoundedNumber<Bounds> = Bounds extends BoundsConfig<infer LowerInc, infer Lower, infer Int, infer Upper, infer UpperInc>
	? (number & ReboundedFromConfig<LowerInc, Lower, Int, Upper, UpperInc>)
	: Bounds extends CheckedBoundsConfig<infer IsLowerInc extends boolean, infer Lower extends number, infer IsInt extends boolean, infer Upper extends number, infer IsUpperInc extends boolean>
		? (number & ReboundedFromChecked<IsLowerInc, Lower, IsInt, Upper, IsUpperInc>)
	: never;

/**
 * Helper for checking if you're dealing with a {@link BoundedNumber}.
 */
export type IsBounded<N extends number> = N extends { [ BOUNDS ]: object } ? true : false;

/**
 * You could also just cast to `number`, but this provides a nice
 * explicit and hard-to-miss visual.  It is also helpful in downstream
 * type definitions where you need the bound types to be fungible.
 */
export type Unbound<N extends number> = IsBounded<N> extends true ? number : N;

/**
 * Extract the value for the lower bound.
 */
export type LowerBound<N extends number> = N extends { [ BOUNDS ]: { lower: infer Lower extends number } } ? Lower : never;

/**
 * Extract whether the lower bound is inclusive (true) or exclusive (false).
 */
export type LowerBoundIsInc<N extends number> = N extends { [ BOUNDS ]: { lowerInc: infer LowerInc extends LowerInEx } } ? LowerInc extends LowerInclusive ? true : false : never;

/**
 * Extract the value for the upper bound.
 */
export type UpperBound<N extends number> = N extends { [ BOUNDS ]: { upper: infer Upper extends number } } ? Upper : never;

/**
 * Extract whether the lower bound is inclusive (true) or exclusive (false).
 */
export type UpperBoundIsInc<N extends number> = N extends { [ BOUNDS ]: { upperInc: infer UpperInc extends UpperInEx } } ? UpperInc extends UpperInclusive ? true : false : never;

/**
 * Extract whether the number only accepts integers.
 */
export type IsIntegersOnly<N extends number> = N extends { [ BOUNDS ]: { int: IntegerSet } } ? true : false;

/**
 * Whether the number has defined bounds (neither upper nor lower is infinite).
 */
export type IsFinite<N extends number> = N extends { [ BOUNDS ]: { lower: infer Lower extends number; upper: infer Upper extends number } } ? Lower extends InfinityBound ? false : Upper extends InfinityBound ? false : true : never;

/**
 * Whether the number has infinite bounds, either upper or lower.
 */
export type IsInfinite<N extends number> = N extends { [ BOUNDS ]: { lower: infer Lower extends number; upper: infer Upper extends number } } ? Lower extends InfinityBound ? true : Upper extends InfinityBound ? true : false : never;

export type OutOfBoundsErrorProvider = (value: unknown, name?: string | undefined) => Error;
