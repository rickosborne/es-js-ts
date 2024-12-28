import { expect } from "chai";
import { describe, it } from "mocha";
import { centroidOfPolygon } from "../centroid.js";
import { allFixtures } from "./shape-fixtures.js";

describe(centroidOfPolygon.name, () => {
	allFixtures.forEach(({ centroid, name, polygon }) => {
		it(name, () => {
			expect(centroidOfPolygon(polygon)).eql(centroid);
		});
	});
	it("is undefined for no points", () => {
		expect(centroidOfPolygon({ points: [] })).eq(undefined);
	});
	it("works for a point", () => {
		const p = { x: 1, y: 2 };
		expect(centroidOfPolygon({ points: [ p ] })).eql(p);
	});
	it("works for line segment", () => {
		expect(centroidOfPolygon({
			points: [
				{ x: 1, y: 2 },
				{ x: 5, y: 10 },
			],
		})).eql({ x: 3, y: 6 });
	});
});
