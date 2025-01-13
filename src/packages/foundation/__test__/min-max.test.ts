import { describe, it } from "mocha";
import { expect } from "chai";
import { minMax } from "../min-max.js";

describe(minMax.name, () => {
	it("returns infinities for an empty list", () => {
		expect(minMax([])).eql([ -Infinity, Infinity ]);
		expect(minMax()).eql([ -Infinity, Infinity ]);
	});
	it("does what it says", () => {
		expect(minMax(7)).eql([ 7, 7 ]);
		expect(minMax([ 7 ])).eql([ 7, 7 ]);
		expect(minMax(7, 5, 9)).eql([ 5, 9 ]);
		expect(minMax([ 7, 5, 9 ])).eql([ 5, 9 ]);
	});
	it("handles JS type-oblivious calls", () => {
		expect((minMax as (first: number[], ...rest: number[]) => [number, number])([ 7, 5, 9 ], 1, 2, 3)).eql([ 1, 9 ]);
	});
});
