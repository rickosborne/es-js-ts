import { expect } from "chai";
import { describe, it } from "mocha";
import type { CSSAngleUnit } from "../angle.js";
import { ANGLE_CONVERSIONS } from "../angle.js";
import { CSSError } from "../css-error.js";
import { convertBetweenUnits, dimensionFromCSS } from "../units.js";

describe("units", () => {
	describe(dimensionFromCSS.name, () => {
		it("handles none and 0", () => {
			expect(dimensionFromCSS("none")).eql([ 0, undefined ]);
			expect(dimensionFromCSS("0")).eql([ 0, undefined ]);
		});
		it("handles bare numbers", () => {
			expect(dimensionFromCSS("123")).eql([ 123, undefined ]);
			expect(dimensionFromCSS("12.3")).eql([ 12.3, undefined ]);
			expect(dimensionFromCSS("12.")).eql([ 12, undefined ]);
			expect(dimensionFromCSS("-12.3")).eql([ -12.3, undefined ]);
			expect(dimensionFromCSS("-123")).eql([ -123, undefined ]);
		});
		it("throws for garbage", () => {
			expect(dimensionFromCSS(undefined)).eql([ undefined, undefined ]);
			expect(dimensionFromCSS("   ")).eql([ undefined, undefined ]);
			expect(() => dimensionFromCSS("pizza pies")).throws(CSSError, "Error in CSS: pizza pies");
			expect(() => dimensionFromCSS("12 pizza pies")).throws(CSSError, "Non-unit after number: pizza pies");
		});
	});

	describe(convertBetweenUnits.name, () => {
		it("is undef for missing conversions", () => {
			expect(convertBetweenUnits<CSSAngleUnit, number>(123, "deg", "bar" as CSSAngleUnit, ANGLE_CONVERSIONS)).eq(undefined);
			expect(convertBetweenUnits<CSSAngleUnit, number>(123, "bar" as CSSAngleUnit, "deg", ANGLE_CONVERSIONS)).eq(undefined);
			expect(convertBetweenUnits<CSSAngleUnit, number>(undefined, "turn", "deg", ANGLE_CONVERSIONS)).eq(undefined);
		});
	});
});
