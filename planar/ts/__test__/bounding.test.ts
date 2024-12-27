import { expect } from "chai";
import { describe, it } from "mocha";
import { boundingBoxOf, boundingBoxOfCircle, boundingBoxOfLineSegment, boundingBoxOfPath } from "../bounding.js";

describe(boundingBoxOfCircle.name, () => {
	it("works with zero radius", () => {
		expect(boundingBoxOfCircle({ r: 0, x: 1, y: 2 })).eql({ h: 0, w: 0, x: 1, y: 2 });
	});
	it("works with positive radius", () => {
		expect(boundingBoxOfCircle({ r: 3, x: 1, y: 2 })).eql({ h: 6, w: 6, x: -2, y: -1 });
	});
});

describe(boundingBoxOfPath.name, () => {
	it("works for an empty path", () => {
		expect(boundingBoxOfPath({ points: [] })).eql({ h: Infinity, w: Infinity, x: -Infinity, y: -Infinity });
	});
	it("works for a point", () => {
		expect(boundingBoxOfPath({ points: [ { x: 1, y: 2 } ] })).eql({ h: 0, w: 0, x: 1, y: 2 });
	});
	it("works for a line segment", () => {
		expect(boundingBoxOfPath({
			points: [
				{ x: 1, y: 2 },
				{ x: 3, y: 5 },
			],
		})).eql({ h: 3, w: 2, x: 1, y: 2 });
	});
	it("works for larger", () => {
		expect(boundingBoxOfPath({
			points: [
				{ x: 1, y: 2 },
				{ x: 5, y: 9 },
				{ x: 3, y: 7 },
			],
		})).eql({ h: 7, w: 4, x: 1, y: 2 });
	});
});

describe(boundingBoxOfLineSegment.name, () => {
	it("works as advertised", () => {
		expect(boundingBoxOfLineSegment({
			blue: { x: 1, y: 2 },
			gold: { x: 3, y: 5 },
		})).eql({ h: 3, w: 2, x: 1, y: 2 });
	});
});

describe(boundingBoxOf.name, () => {
	it("delegates", () => {
		expect(boundingBoxOf({ r: 3, x: 1, y: 2 })).eql({ h: 6, w: 6, x: -2, y: -1 });
		expect(boundingBoxOf({
			points: [
				{ x: 1, y: 2 },
				{ x: 3, y: 5 },
			],
		})).eql({ h: 3, w: 2, x: 1, y: 2 });
		expect(boundingBoxOf({
			blue: { x: 1, y: 2 },
			gold: { x: 3, y: 5 },
		})).eql({ h: 3, w: 2, x: 1, y: 2 });
		expect(boundingBoxOf({ h: 3, w: 2, x: 1, y: 2 })).eql({ h: 3, w: 2, x: 1, y: 2 });
	});
});
