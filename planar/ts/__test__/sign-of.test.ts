import { describe, it } from "mocha";
import { expect } from "chai";
import { signOf } from "../sign-of.js";

describe(signOf.name, () => {
	it(" does what it says", () => {
		expect(signOf(0), "0").eq(0);
		expect(signOf(-0), "-0").eq(0);
		expect(signOf(5), "5").eq(1);
		expect(signOf(-6), "-6").eq(-1);
		expect(signOf(Infinity), "Infinity").eq(1);
		expect(signOf(-Infinity), "-Infinity").eq(-1);
		expect(isNaN(signOf(NaN)), "NaN").eq(true);
	});
});
