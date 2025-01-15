import { expect } from "chai";
import { describe, it } from "mocha";
import type { AssertExact, AssertIfPresent } from "../assert-bounded.js";
import { Rebound } from "../rebound.js";
import { assertSameBounds, sameBounds } from "../same-bounds.js";
import { BOUNDS, INT_SET, LOWER_EX, UPPER_IN } from "../spec.js";

describe(Rebound.name, () => {
	describe("builder", () => {
		const grade = Rebound.buildType("Grade").integers().fromExclusive(0).toInclusive(100).build();
		it("slowly progresses to being done", () => {
			expect(grade.lower, "lowerValue").eq(0);
			expect(grade.lowerInc, "lowerInc").eq(LOWER_EX);
			expect(grade.int, "int").eq(INT_SET);
			expect(grade.upperInc, "upperInc").eq(UPPER_IN);
			expect(grade.upper, "upperValue").eq(100);
		});
	});
	describe("guard", () => {
		const grade = Rebound.buildType("Grade").integers().fromExclusive(0).toInclusive(100).build();
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
			assertSameBounds(guard, grade[BOUNDS]);
		});
		it("guard requires a value, but guardIfPresent does not", () => {
			const { guard, guardIfPresent } = grade;
			expect(guard(undefined), "guard undef").eq(false);
			expect(guardIfPresent(undefined), "guardIfPresent undef").eq(true);
			expect(guard.name, "guard.name").eq("isGrade");
			expect(guardIfPresent.name, "guardIfPresent.name").eq("isGradeIfPresent");
		});
		it("returns the same guard unless renamed", () => {
			const isGrade = grade.guard;
			expect(isGrade.name, "isGrade.name").eq("isGrade");
			expect(grade.guard, "2nd unnamed").eq(isGrade);
			const isGradeIfPresent = grade.guardIfPresent;
			expect(isGradeIfPresent, "isGradeIfPresent !== isGrade").not.eq(isGrade);
			expect(isGradeIfPresent.name, "isGradeIfPresent.name").eq("isGradeIfPresent");
			assertSameBounds(isGrade, isGradeIfPresent);
			const customName = grade.guardNamed("isaGrade");
			expect(customName.name, "customName: isaGrade").eq("isaGrade");
			expect(customName, "customName !== isGrade").not.eq(isGrade);
			expect(grade.guard, "3rd unnamed").eq(isGrade);
			expect(grade.guardNamed(isGrade.name)).eq(isGrade);
			expect(grade.guardNamed(customName.name)).eq(customName);
			assertSameBounds(isGrade, customName);
		});
	});
	describe("outOfRangeError", () => {
		const positiveInt = Rebound.buildType("PositiveInt").fromExclusive(0).toPosInfinity(false).integers().build();
		type PositiveInt = typeof positiveInt.numberType;
		const positiveReal = Rebound.buildType("PositiveReal").fromExclusive(0).toPosInfinity(false).reals().build();
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
			expect(error!.message).eq("Expected nope in (0 int +∞), actual: 7.5");
			expect(error!.stack).to.not.match(/buildError|outOfRangeError/);
			expect(sameBounds(positiveInt, assertPositiveInt), "sameBounds").eq(true);
			const assertPositiveReal: AssertIfPresent<typeof positiveReal.numberType> = positiveReal.assert
		});
	});
});
