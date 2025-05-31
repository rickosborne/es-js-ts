import { expect } from "chai";
import { describe, test } from "mocha";
import { hexesWithin } from "../hexes-within.js";

describe(hexesWithin.name, () => {
	const examples: [ radius: number, expected: number ][] = [
		[ 0, 1 ],
		[ 1, 7 ],
		[ 2, 19 ],
		[ 3, 37 ],
		[ 4, 61 ],
	];
	for (const [ radius, expected ] of examples) {
		test(`${ radius } -> ${ expected }`, () => {
			expect(hexesWithin(radius)).eq(expected);
		});
	}

	test("bad radius", () => {
		expect(() => hexesWithin(NaN)).throws(RangeError);
		expect(() => hexesWithin(-1)).throws(RangeError);
		expect(() => hexesWithin(2.7)).throws(RangeError);
	});
});
