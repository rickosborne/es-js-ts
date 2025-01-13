import { entriesOf } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, it } from "mocha";
import { angle01FromCSS, ANGLE_CONVERSIONS, ANGLE_UNITS, isAngleUnit } from "../angle.js";
import { CSSError } from "../css-error.js";

describe("angle", () => {
	it(isAngleUnit.name, () => {
		for (const unit of ANGLE_UNITS) {
			expect(isAngleUnit(unit), unit).eq(true);
			expect(isAngleUnit(unit.concat("!")), `${unit}!`).eq(false);
		}
		expect(isAngleUnit("garbage")).eq(false);
		expect(isAngleUnit({})).eq(false);
	});
	it(angle01FromCSS.name, () => {
		for (const [ unit, conversion ] of entriesOf(ANGLE_CONVERSIONS)) {
			expect(angle01FromCSS(`15${unit}`)).eq(15 / conversion);
			expect(angle01FromCSS("17", unit)).eq(17 / conversion);
		}
		expect(angle01FromCSS("0.19", "turn")).eq(0.19);
		expect(angle01FromCSS(undefined)).eq(undefined);
		expect(() => angle01FromCSS("5pizza")).throws(CSSError, "Unknown CSS angle unit: pizza");
	});
});
