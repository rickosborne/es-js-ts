import { expect } from "chai";
import { describe, test } from "mocha";
import { divMod, positiveDiv, positiveMod } from "../modulo.js";

describe(positiveMod.name, () => {
	test("positive", () => {
		expect(positiveMod(5, 10), "5 % 10").eq(5);
		expect(positiveMod(5, 10)).eq(5);
		expect(positiveMod(16, 10)).eq(6);
		expect(positiveMod(18, 9)).eq(0);
		expect(positiveMod(5, 2.5)).eq(0);
		expect(positiveMod(5.2, 2.5)).closeTo(0.2, 0.0001);
		expect(positiveMod(2.7, 2.5)).closeTo(0.2, 0.0001);
		expect(positiveMod(5, 2.5)).eq(0);
	});
	test("zero", () => {
		expect(positiveMod(5, 0)).is.NaN;
		expect(positiveMod(0, 5)).eq(0);
		expect(positiveMod(5, 5)).eq(0);
		expect(positiveMod(0, 0)).is.NaN;
	});
	test("negative", () => {
		expect(positiveMod(-90, 360)).eq(270);
		expect(positiveMod(-450, 360)).eq(270);
		expect(positiveMod(-360, 360)).eq(0);
		expect(positiveMod(-720, 360)).eq(0);
		expect(positiveMod(720, -360)).eq(0);
		expect(positiveMod(-720, -360)).eq(0);
		expect(positiveMod(-450, 360)).eq(270);
		expect(positiveMod(450, -360)).eq(90);
		expect(positiveMod(-450, -360)).eq(270);
	});
	it("matches wikipedia examples", () => {
		expect(divMod(7, 3)).eql([ 2, 1 ]);
		expect(divMod(7, -3)).eql([ -2, 1 ]);
		expect(divMod(-7, 3)).eql([ -3, 2 ]);
		expect(divMod(-7, -3)).eql([ 3, 2 ]);
		expect(positiveDiv(7, 3)).eq(2);
		expect(positiveDiv(7, -3)).eq(-2);
		expect(positiveDiv(-7, 3)).eq(-3);
		expect(positiveDiv(-7, -3)).eq(3);
	});
});
