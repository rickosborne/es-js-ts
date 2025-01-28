import { expect } from "chai";
import { describe, it } from "mocha";
import type { AssertExact, AssertIfPresent } from "../assert-bounded.js";
import { Rebound } from "../rebound.js";
import { assertSameBounds, sameBounds } from "../same-bounds.js";
import { BOUNDS } from "../spec.js";

describe(Rebound.name, () => {
	describe("builder", () => {
		const grade = Rebound.buildType("Grade").integers().fromInclusive(0).toInclusive(100).build();
		it("slowly progresses to being done", () => {
			expect(grade.lower, "lowerValue").eq(0);
			expect(grade.isLowerInc, "isLowerInc").eq(true);
			expect(grade.isInt, "isInt").eq(true);
			expect(grade.isUpperInc, "isUpperInc").eq(true);
			expect(grade.upper, "upperValue").eq(100);
		});
		it("throws for invalid bounds", () => {
			expect(() => Rebound.buildType("upper < lower").toInclusive(4).fromExclusive(6)).throws(Error, "Bounds are reversed");
			expect(() => Rebound.buildType("lower > upper").fromExclusive(4).toInclusive(2)).throws(Error, "Bounds are reversed");
			expect(() => Rebound.buildType("lower = NaN").fromExclusive(Number.NaN)).throws(Error, "Bound cannot be NaN");
			expect(() => Rebound.buildType("upper = NaN").toInclusive(Number.NaN)).throws(Error, "Bound cannot be NaN");
			expect(() => Rebound.buildType("upper = -Infinity").toInclusive(-Infinity)).throws(Error, "Use Infinity for an upper bound");
			expect(() => Rebound.buildType("lower = Infinity").fromExclusive(Infinity)).throws(Error, "Use -Infinity for a lower bound");
		});
	});
	describe("guard", () => {
		const grade = Rebound.buildType("Grade").integers().fromInclusive(1).toInclusive(100).build();
		type Grade = typeof grade.numberType;
		it("guards do not require this", () => {
			const { guard } = grade;
			expect(guard(95 as Grade), "95").eq(true);
			expect(guard(107), "107").eq(false);
			expect(guard(88.8), "88.8").eq(false);
			expect(guard(0), "0").eq(false);
			expect(guard(100), "100").eq(true);
			expect(guard.name, "guard.name").eq("isGrade");
			expect(guard.call(undefined, 100), "undef this").eq(true);
			expect(guard.call("obj" as unknown as void, 10), "string this").eq(true);
			assertSameBounds(guard, grade);
			assertSameBounds(guard, grade[ BOUNDS ]);
		});
		it("guard requires a value, but guardIfPresent does not", () => {
			const guard = grade.guard;
			const guardIfPresent = grade.guardWith({ ifPresent: true });
			expect(guard(undefined), "guard undef").eq(false);
			expect(guardIfPresent(undefined), "guardIfPresent undef").eq(true);
			expect(guard.name, "guard.name").eq("isGrade");
			expect(guardIfPresent.name, "guardIfPresent.name").eq("isGradeIfPresent");
		});
		it("returns the same guard unless renamed", () => {
			const isGrade = grade.guard;
			expect(isGrade.name, "isGrade.name").eq("isGrade");
			expect(grade.guard, "2nd unnamed").eq(isGrade);
			const isGradeIfPresent = grade.guardWith({ ifPresent: true });
			expect(isGradeIfPresent, "isGradeIfPresent !== isGrade").not.eq(isGrade);
			expect(isGradeIfPresent.name, "isGradeIfPresent.name").eq("isGradeIfPresent");
			assertSameBounds(isGrade, isGradeIfPresent);
			const customName = grade.guardWith({ fnName: "isaGrade" });
			expect(customName.name, "customName: isaGrade").eq("isaGrade");
			expect(customName, "customName !== isGrade").not.eq(isGrade);
			expect(grade.guard, "3rd unnamed").eq(isGrade);
			expect(grade.guardWith({ fnName: isGrade.name })).eq(isGrade);
			expect(grade.guardWith({ fnName: customName.name })).eq(customName);
			assertSameBounds(isGrade, customName);
		});
	});
	describe("outOfRangeError", () => {
		const positiveInt = Rebound.buildType("PositiveInt").fromInclusive(1).toPosInfinity().integers().build();
		type PositiveInt = typeof positiveInt.numberType;
		const positiveReal = Rebound.buildType("PositiveReal").fromExclusive(0).toPosInfinity().reals().build();
		it("is a RangeError", () => {
			const four: PositiveInt | number = 4;
			const assertPositiveInt: AssertExact<PositiveInt> = positiveInt.assert;
			assertPositiveInt(four, "four");
			expect(positiveInt.guard(four)).eq(true);
			let error: Error | undefined;
			try {
				assertPositiveInt(7.5, "nope");
			} catch (err: unknown) {
				if (err instanceof Error) {
					error = err;
				} else {
					expect.fail("Not an error");
				}
			}
			expect(error).instanceOf(RangeError);
			expect(error!.message).eq("Expected nope: PositiveInt [1..+∞], actual: 7.5");
			expect(error!.stack).to.not.match(/buildError|outOfRangeError/);
			expect(sameBounds(positiveInt, assertPositiveInt), "sameBounds").eq(true);
			const assertPositiveReal: AssertIfPresent<typeof positiveReal.numberType> = positiveReal.assertWith({ ifPresent: true });
			expect(() => assertPositiveReal(-4)).throws(RangeError);
			expect(() => assertPositiveReal(7.5)).does.not.throw(Error);
			expect(sameBounds(assertPositiveInt, assertPositiveReal)).eq(false);
		});
	});
	describe("fromNumber", () => {
		it("upgrades", () => {
			const positiveInt = Rebound.buildType("PositiveInt").fromInclusive(1).toPosInfinity().integers().build();
			const pos = 7;
			const neg = -5;
			const posNum = positiveInt.fromNumber(pos);
			expect(posNum, "called with plain fromNumber").eq(pos);
			expect(positiveInt.fromNumber.name, "fromNumber.name").eq("positiveIntFromNumber");
			expect(() => positiveInt.fromNumber(neg), "fromNumber(neg)").throws(RangeError, /\bPositiveInt\b/);
			expect(() => positiveInt.fromNumber(undefined as unknown as number)).throws(RangeError, /\bPositiveInt\b.+undefined/);
			const maybePos = positiveInt.fromNumberWith({ ifPresent: true })(undefined);
			expect(maybePos, "undefined").eq(undefined);
		});
	});
	describe("random", () => {
		it("throws for bad ranges", () => {
			expect(() => Rebound.buildType("PosInf").fromInclusive(0).toPosInfinity().reals().build().random()).throws(RangeError, "Unbounded random");
			expect(() => Rebound.buildType("NegInf").fromNegInfinity().toInclusive(0).reals().build().random()).throws(RangeError, "Unbounded random");
			expect(() => Rebound.buildType("[0,0]").fromInclusive(0).toInclusive(0).reals().build().random()).throws(RangeError, "Random range too narrow");
			expect(() => Rebound.buildType("[1..1]").fromInclusive(1).toInclusive(1).integers().build().random()).throws(RangeError, "Random range too narrow");
		});
		it("generates random integers", () => {
			const positive = Rebound.buildType("positive").fromInclusive(0).toInclusive(100).integers().build();
			for (let n = 0; n < 100; n++) {
				const r = positive.random();
				expect(Math.trunc(r)).eq(r);
				expect(r).gte(0);
				expect(r).lte(100);
			}
			const narrow = Rebound.buildType("narrow").fromInclusive(3).toInclusive(4).integers().build();
			for (let n = 0; n < 100; n++) {
				const r = narrow.random();
				expect(Math.trunc(r)).eq(r);
				expect(r).gte(3);
				expect(r).lt(5);
			}
		});
		it("generates random reals", () => {
			const positive = Rebound.buildType("positive").fromInclusive(0).toInclusive(100).reals().build();
			for (let n = 0; n < 100; n++) {
				const r = positive.random();
				expect(r).gte(0);
				expect(r).lte(100);
			}
			const zeroOne = Rebound.buildType("positive").fromInclusive(0).toExclusive(1).reals().build();
			for (let n = 0; n < 100; n++) {
				const r = zeroOne.random();
				expect(r).gte(0);
				expect(r).lt(1);
			}
		});
	});
	describe("generators", () => {
		it("works for valid input", () => {
			const stars = Rebound.buildType("Stars").fromInclusive(0).toInclusive(5).reals().build();
			expect(Array.from(stars.integers)).eql([ 0, 1, 2, 3, 4, 5 ]);
			expect(Array.from(stars.integersWith({ start: 1 }))).eql([ 1, 2, 3, 4, 5 ]);
			expect(Array.from(stars.integersWith({ end: 4 }))).eql([ 0, 1, 2, 3, 4 ]);
			expect(Array.from(stars.integersWith({ step: -1 }))).eql([ 5, 4, 3, 2, 1, 0 ]);
			expect(Array.from(stars.integersWith({ step: -2 }))).eql([ 5, 3, 1 ]);
		});
		it("throws for garbage", () => {
			expect(() => Array.from(Rebound.buildType("NegInf").fromNegInfinity().toInclusive(0).integers().build().integers)).throws(RangeError, "Unbounded start");
		});
		it("fast-returns for impossible ranges", () => {
			const stars = Rebound.buildType("Stars").fromInclusive(0).toInclusive(5).reals().build();
			expect(Array.from(stars.integersWith({ start: 6 }))).eql([]);
			expect(Array.from(stars.integersWith({ end: -1 }))).eql([]);
			expect(Array.from(stars.integersWith({ end: 1, start: 2 }))).eql([]);
			expect(Array.from(stars.integersWith({ end: 2, start: 1, step: -1 }))).eql([]);
		});
	});
});
