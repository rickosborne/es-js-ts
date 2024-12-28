import { expect } from "chai";
import { describe, it } from "mocha";
import { STRAIGHT } from "../2d.js";
import { cartesianOrientationOfPolygon, gfxOrientationOfPolygon } from "../orientation.js";
import { allFixtures } from "./shape-fixtures.js";

describe(cartesianOrientationOfPolygon.name, () => {
	allFixtures.forEach(({ name, orientation, overallOrientation, polygon }) => {
		it(name, () => {
			expect(cartesianOrientationOfPolygon(polygon)).eq(orientation ?? overallOrientation ?? STRAIGHT);
			expect(gfxOrientationOfPolygon(polygon)).eq(-(orientation ?? overallOrientation ?? STRAIGHT));
		});
	});
});
