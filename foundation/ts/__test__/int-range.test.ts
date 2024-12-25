import { describe, it } from "mocha";
import { expect } from "chai";
import { intRange } from "../int-range.js";

describe("ints", () => {
	it("does nothing if the range is impossible", () => {
		expect(intRange.from(5).up.toInclusive(4).toArray(), "[5..4]").eql([ ]);
		expect(intRange.from(5).up.toExclusive(5).toArray(), "[5..5)").eql([ ]);
		expect(intRange.from(5).down.toInclusive(6).toArray(), "[5..6]-1").eql([ ]);
		expect(intRange.from(5).down.toExclusive(5).toArray(), "[5..5)-1").eql([ ]);
	});
	it("works for single values", () => {
		expect(intRange.from(0).up.toInclusive(0).toArray(), "[0..0]").eql([ 0 ]);
		expect(intRange.from(0).up.toExclusive(1).toArray(), "[0..1)").eql([ 0 ]);
		expect(intRange.from(0).down.toInclusive(0).toArray(), "[0..0]").eql([ 0 ]);
		expect(intRange.from(1).down.toExclusive(0).toArray(), "[1..0)-1").eql([ 1 ]);
	});
	it("works for simple counts up", () => {
		expect(intRange.from(0).up.toInclusive(4).toArray(), "[0..4]").eql([ 0, 1, 2, 3, 4 ]);
		expect(intRange.from(0).up.toExclusive(4).toArray(), "[0..4)").eql([ 0, 1, 2, 3 ]);
	});
	it("works for skip counts up", () => {
		expect(intRange.from(0).by(2).toInclusive(6).toArray(), "[0..6]+2").eql([ 0, 2, 4, 6 ]);
		expect(intRange.from(0).by(2).toExclusive(6).toArray(), "[0..6)+2").eql([ 0, 2, 4 ]);
	});
	it("works for simple counts down", () => {
		expect(intRange.from(4).down.toInclusive(0).toArray(), "[4..0]").eql([ 4, 3, 2, 1, 0 ]);
		expect(intRange.from(4).down.toExclusive(0).toArray(), "[4..0)").eql([ 4, 3, 2, 1 ]);
	});
	it("works for skip counts down", () => {
		expect(intRange.from(6).by(-2).toInclusive(0).toArray(), "[6..0]-2").eql([ 6, 4, 2, 0 ]);
		expect(intRange.from(6).by(-2).toExclusive(0).toArray(), "[6..0)-2").eql([ 6, 4, 2 ]);
	});
});
