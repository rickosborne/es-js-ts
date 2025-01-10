import { expect } from "chai";
import { describe, it } from "mocha";
import { detailedIsConvex, fastIsConvex } from "../is-convex.js";
import { allFixtures } from "./shape-fixtures.js";

describe(fastIsConvex.name, () => {
	allFixtures.forEach(({ convex, name, polygon }) => {
		it(name, () => {
			expect(fastIsConvex(polygon)).eq(convex);
		});
	});
});

describe(detailedIsConvex.name, () => {
	allFixtures.forEach(({ badPoints, convex, firstOrientation, name, orientation, overallOrientation, polygon }) => {
		it(name, () => {
			const isConvex = detailedIsConvex(polygon);
			expect(isConvex.convex, "convex").eq(convex);
			expect(isConvex.badPoints, "badPoints").eql(badPoints);
			if (isConvex.convex) {
				expect(isConvex.orientation, "orientation").eq(orientation);
			} else {
				expect(isConvex.orientation, "orientation").eq(undefined);
				expect(isConvex.firstOrientation, "firstOrientation").eq(firstOrientation);
				expect(isConvex.overallOrientation, "overallOrientation").eq(overallOrientation);
			}
		});
	});
});
