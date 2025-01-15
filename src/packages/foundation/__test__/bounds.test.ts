import { assertInt255, assertInt360, assertReal01, type Int255, int255From01, type Int360, isInt255, isInt360, isReal01, type Real01, real01From255, toInt255, toInt360, toReal01 } from "../bounds.js";
import { expect } from "chai";
import { describe, it } from "mocha";

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

describe("Real01", () => {
	rangeTest<Real01>(isReal01, assertReal01, toReal01, 0, true, 1, true, false);
});

describe(int255From01.name, () => {
	it("is null-transparent", () => {
		expect(int255From01(undefined)).eq(undefined);
	});
	it("is still math", () => {
		expect(int255From01(toReal01(0))).eq(0);
		expect(int255From01(toReal01(0.2))).eq(51);
		expect(int255From01(toReal01(0.4))).eq(102);
		expect(int255From01(toReal01(0.6))).eq(153);
		expect(int255From01(toReal01(0.8))).eq(204);
		expect(int255From01(toReal01(1))).eq(255);
	});
});

describe(real01From255.name, () => {
	it("is null-transparent", () => {
		expect(real01From255(undefined)).eq(undefined);
	});
	it("is still math", () => {
		expect(real01From255(toInt255(0))).eq(0);
		expect(real01From255(toInt255(51))).eq(0.2);
		expect(real01From255(toInt255(102))).eq(0.4);
		expect(real01From255(toInt255(153))).eq(0.6);
		expect(real01From255(toInt255(204))).eq(0.8);
		expect(real01From255(toInt255(255))).eq(1.0);
	});
});
