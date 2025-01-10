import { expect } from "chai";
import { describe, it } from "mocha";
import { polygonFromLineSegment, polygonFromRect } from "../polygon-from.js";

describe(polygonFromRect.name, () => {
	it("works for a point", () => {
		expect(polygonFromRect({ h: 0, w: 0, x: 1, y: 2 })).eql({ points: [ { x: 1, y: 2 } ] });
	});
	it("works for a line segment", () => {
		expect(polygonFromRect({ h: 3, w: 0, x: 1, y: 2 })).eql({ points: [ { x: 1, y: 2 }, { x: 1, y: 5 } ] });
		expect(polygonFromRect({ h: 0, w: 4, x: 1, y: 2 })).eql({ points: [ { x: 1, y: 2 }, { x: 5, y: 2 } ] });
	});
	it("works for a rect", () => {
		expect(polygonFromRect({ h: 3, w: 7, x: 1, y: 2 })).eql({
			points: [
				{ x: 1, y: 2 },
				{ x: 8, y: 2 },
				{ x: 8, y: 5 },
				{ x: 1, y: 5 },
			],
		});
	});
});

describe(polygonFromLineSegment.name, () => {
	it("works for a point", () => {
		const p = { x: 1, y: 2 };
		expect(polygonFromLineSegment({ blue: p, gold: { ...p } })).eql({ points: [ p ] });
	});
	it("works for a segment", () => {
		const a = { x: 1, y: 2 };
		const b = { x: 0, y: 5 };
		const c = { x: 0, y: 2 };
		expect(polygonFromLineSegment({ blue: a, gold: b })).eql({ points: [ b, a ] });
		expect(polygonFromLineSegment({ blue: b, gold: a })).eql({ points: [ b, a ] });
		expect(polygonFromLineSegment({ blue: a, gold: c })).eql({ points: [ c, a ] });
		expect(polygonFromLineSegment({ blue: c, gold: a })).eql({ points: [ c, a ] });
		expect(polygonFromLineSegment({ blue: c, gold: b })).eql({ points: [ c, b ] });
		expect(polygonFromLineSegment({ blue: b, gold: c })).eql({ points: [ c, b ] });
	});
});
