import { expect } from "chai";
import { describe, it } from "mocha";
import { assertFloat01, assertInt255, assertInt360, type Float01, float01FromInt255, type Int255, int255FromFloat01, type Int360, isFloat01, isInt255, isInt360, toFloat01, toInt255, toInt360 } from "../numbers.js";

const rangeTest = <T>(
	guard: (value: unknown) => value is T,
	asserter: (value: unknown, name?: string) => asserts value is T,
	upgrade: (value: number | undefined) => T | undefined,
	minValue: number,
	minInclusive: boolean,
	maxValue: number,
	maxInclusive: boolean,
	int: boolean,
	step = int ? 1 : 0.1,
) => {
	describe(guard.name, () => {
		it(`checks the min ${ minValue }`, () => {
			expect(guard(minValue), "guard = min").eq(minInclusive);
			expect(guard(minValue - step), "guard < min").eq(false);
			expect(guard(minValue + step), "guard > min").eq(true);
		});
		it(`checks the max ${ maxValue }`, () => {
			expect(guard(maxValue), "= max").eq(maxInclusive);
			expect(guard(maxValue - step), "< max").eq(true);
			expect(guard(maxValue + step), "> max").eq(false);
		});
		if (int) {
			it("checks integers", () => {
				expect(guard(minValue + 0.1), "min + float").eq(false);
				expect(guard(maxValue - 0.1), "max - float").eq(false);
			});
		}
	});
	describe(asserter.name, () => {
		it(`checks the min ${ minValue }`, () => {
			if (minInclusive) {
				expect(() => asserter(minValue), "asserter = min").not.throws();
			} else {
				expect(() => asserter(minValue), "asserter = min").throws(RangeError);
				expect(() => asserter(minValue, "MIN"), "asserter = min").throws(RangeError, "MIN");
			}
			expect(() => asserter(minValue - step, "MIN"), "asserter < min").throws(RangeError, "MIN");
			expect(() => asserter(minValue + step), "asserter > min").not.throws();
		});
		it(`checks the max ${ maxValue }`, () => {
			if (maxInclusive) {
				expect(() => asserter(maxValue), "asserter = max").not.throws();
			} else {
				expect(() => asserter(maxValue), "asserter = min").throws(RangeError);
				expect(() => asserter(maxValue, "MAX"), "asserter = min").throws(RangeError, "MAX");
			}
			expect(() => asserter(maxValue - step), "asserter < min").not.throws();
			expect(() => asserter(maxValue + step, "MAX"), "asserter > min").throws(RangeError, "MAX");
		});
		if (int) {
			it("checks integers", () => {
				expect(() => asserter(minValue + 0.1), "min + float").throws(RangeError);
				expect(() => asserter(maxValue - 0.1), "max - float").throws(RangeError);
			});
		}
	});
	it(upgrade.name, () => {
		expect(() => upgrade(minValue - step), "upgrade < min").throws(RangeError);
		expect(upgrade(minValue + step), "upgrade > min").a("number");
		expect(() => upgrade(maxValue + step), "upgrade > max").throws(RangeError);
		expect(upgrade(maxValue - step), "upgrade < max").a("number");
		expect(upgrade(undefined), "upgrade undefined").eq(undefined);
	});
};

describe("Int255", () => {
	rangeTest<Int255>(isInt255, assertInt255, toInt255, 0, true, 255, true, true);
});

describe("Int360", () => {
	rangeTest<Int360>(isInt360, assertInt360, toInt360, 0, true, 360, false, true);
});

describe("Float01", () => {
	rangeTest<Float01>(isFloat01, assertFloat01, toFloat01, 0, true, 1, true, false);
});

describe(int255FromFloat01.name, () => {
	it("is null-transparent", () => {
		expect(int255FromFloat01(undefined)).eq(undefined);
	});
	it("is still math", () => {
		expect(int255FromFloat01(toFloat01(0))).eq(0);
		expect(int255FromFloat01(toFloat01(0.2))).eq(51);
		expect(int255FromFloat01(toFloat01(0.4))).eq(102);
		expect(int255FromFloat01(toFloat01(0.6))).eq(153);
		expect(int255FromFloat01(toFloat01(0.8))).eq(204);
		expect(int255FromFloat01(toFloat01(1))).eq(255);
	});
});

describe(float01FromInt255.name, () => {
	it("is null-transparent", () => {
		expect(float01FromInt255(undefined)).eq(undefined);
	});
	it("is still math", () => {
		expect(float01FromInt255(toInt255(0))).eq(0);
		expect(float01FromInt255(toInt255(51))).eq(0.2);
		expect(float01FromInt255(toInt255(102))).eq(0.4);
		expect(float01FromInt255(toInt255(153))).eq(0.6);
		expect(float01FromInt255(toInt255(204))).eq(0.8);
		expect(float01FromInt255(toInt255(255))).eq(1.0);
	});
});
