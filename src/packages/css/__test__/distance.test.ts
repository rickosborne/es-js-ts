import { expect } from "chai";
import { describe, it } from "mocha";
import { ABSOLUTE_LENGTH_UNITS, isAbsoluteLengthUnit, isLengthUnit, isRelativeLengthUnit, RELATIVE_LENGTH_UNITS } from "../distance.js";

describe("distance", () => {
	const testUpper = (unit: string) => {
		const upper = unit.toUpperCase();
		if (unit !== upper) {
			expect(isRelativeLengthUnit(upper), upper).eq(false);
			expect(isAbsoluteLengthUnit(upper), upper).eq(false);
			expect(isLengthUnit(upper), upper).eq(false);
		}
	};
	describe("relative", () => {
		for (const unit of RELATIVE_LENGTH_UNITS) {
			it(unit, () => {
				expect(isRelativeLengthUnit(unit), unit).eq(true);
				expect(isAbsoluteLengthUnit(unit), unit).eq(false);
				expect(isLengthUnit(unit), unit).eq(true);
				testUpper(unit);
			});
		}
	});
	describe("absolute", () => {
		for (const unit of ABSOLUTE_LENGTH_UNITS) {
			it(unit, () => {
				expect(isAbsoluteLengthUnit(unit), unit).eq(true);
				expect(isRelativeLengthUnit(unit), unit).eq(false);
				expect(isLengthUnit(unit), unit).eq(true);
				testUpper(unit);
			});
		}
	});
	it("garbage is not a length unit", () => {
		expect(isRelativeLengthUnit("garbage")).eq(false);
		expect(isRelativeLengthUnit(undefined)).eq(false);
		expect(isAbsoluteLengthUnit("garbage")).eq(false);
		expect(isAbsoluteLengthUnit(undefined)).eq(false);
		expect(isLengthUnit("garbage")).eq(false);
		expect(isLengthUnit(undefined)).eq(false);
	});
});
