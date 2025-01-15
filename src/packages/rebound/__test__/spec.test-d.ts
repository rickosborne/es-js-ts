import { describe, expect, test } from "tstyche";
import { type BoundedNumber, INT_SET, type IntegerSet, type IsBounded, type IsFinite, type IsInfinite, type IsIntegersOnly, LOWER_EX, LOWER_IN, type LowerBound, type LowerBoundIsInc, type LowerInclusive, type NegInfinity, type PosInfinity, REAL_SET, type RealSet, type Unbound, UPPER_EX, type UpperBound, type UpperBoundIsInc, type UpperInclusive } from "../spec.js";

const planetBounds = { lowerInc: LOWER_EX, lower: 0, int: INT_SET, upper: 20, upperInc: UPPER_EX } as const;
type PlanetBounds = typeof planetBounds;
type Planets = BoundedNumber<PlanetBounds>;

const volumeBounds = { lower: 0, lowerInc: LOWER_IN, int: REAL_SET, upper: 100, upperInc: UPPER_EX } as const;
type VolumeBounds = typeof volumeBounds;
type Volume = BoundedNumber<VolumeBounds>;

type Real = BoundedNumber<{ lower: NegInfinity, lowerInc: LowerInclusive, int: RealSet, upper: PosInfinity, upperInc: UpperInclusive }>;

type Int = BoundedNumber<{ lower: NegInfinity, lowerInc: LowerInclusive, int: IntegerSet, upper: PosInfinity, upperInc: UpperInclusive }>;

describe("spec", () => {
	test("BoundLower", () => {
		expect<LowerBound<Planets>>().type.toBe(planetBounds.lower);
		expect<LowerBound<Volume>>().type.toBe(volumeBounds.lower);
		expect<LowerBound<Real>>().type.toBe<NegInfinity>();
		expect<LowerBound<Int>>().type.toBe<NegInfinity>();
		expect<LowerBound<number>>().type.toBeNever();
	});
	test("LowerBoundIsInc", () => {
		expect<LowerBoundIsInc<Planets>>().type.toBe(false);
		expect<LowerBoundIsInc<Volume>>().type.toBe(true);
		expect<LowerBoundIsInc<Real>>().type.toBe(true);
		expect<LowerBoundIsInc<Int>>().type.toBe(true);
		expect<LowerBoundIsInc<number>>().type.toBeNever();
	});
	test("BoundUpper", () => {
		expect<UpperBound<Planets>>().type.toBe(planetBounds.upper);
		expect<UpperBound<Volume>>().type.toBe(volumeBounds.upper);
		expect<UpperBound<Real>>().type.toBe<PosInfinity>();
		expect<UpperBound<Int>>().type.toBe<PosInfinity>();
		expect<UpperBound<number>>().type.toBeNever();
	});
	test("UpperBoundIsInc", () => {
		expect<UpperBoundIsInc<Planets>>().type.toBe(false);
		expect<UpperBoundIsInc<Volume>>().type.toBe(false);
		expect<UpperBoundIsInc<Real>>().type.toBe(true);
		expect<UpperBoundIsInc<Int>>().type.toBe(true);
		expect<UpperBoundIsInc<number>>().type.toBeNever();
	});
	test("IsIntegersOnly", () => {
		expect<IsIntegersOnly<Planets>>().type.toBe(true);
		expect<IsIntegersOnly<Volume>>().type.toBe(false);
		expect<IsIntegersOnly<Real>>().type.toBe(false);
		expect<IsIntegersOnly<Int>>().type.toBe(true);
		expect<IsIntegersOnly<number>>().type.toBe(false);
	});
	test("IsBounded", () => {
		expect<IsBounded<Planets>>().type.toBe(true);
		expect<IsBounded<Volume>>().type.toBe(true);
		expect<IsBounded<Real>>().type.toBe(true);
		expect<IsBounded<Int>>().type.toBe(true);
		expect<IsBounded<number>>().type.toBe(false);
	});
	test("Unbound", () => {
		expect<Unbound<Planets>>().type.toBe<number>();
		expect<Unbound<Volume>>().type.toBe<number>();
		expect<Unbound<Real>>().type.toBe<number>();
		expect<Unbound<Int>>().type.toBe<number>();
		expect<Unbound<number>>().type.toBe<number>();
	});
	test("IsInfinite", () => {
		expect<IsInfinite<Planets>>().type.toBe(false);
		expect<IsInfinite<Volume>>().type.toBe(false);
		expect<IsInfinite<Real>>().type.toBe(true);
		expect<IsInfinite<Int>>().type.toBe(true);
		expect<IsInfinite<number>>().type.toBeNever();
	});
	test("NotInfinite", () => {
		expect<IsFinite<Planets>>().type.toBe(true);
		expect<IsFinite<Volume>>().type.toBe(true);
		expect<IsFinite<Real>>().type.toBe(false);
		expect<IsFinite<Int>>().type.toBe(false);
		expect<IsFinite<number>>().type.toBeNever();
	});
});
