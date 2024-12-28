import { expect } from "chai";
import { describe, it } from "mocha";
import { cartesianOrientationOfPolygon, gfxOrientationOfPolygon } from "../orientation.js";
import { allFixtures } from "./shape-fixtures.js";

describe(cartesianOrientationOfPolygon.name, () => {
	allFixtures.forEach(({ name, orientation, polygon }) => {
		it(name, () => {
			expect(cartesianOrientationOfPolygon(polygon)).eq(orientation);
			expect(gfxOrientationOfPolygon(polygon)).eq(-orientation);
		});
	});
});
