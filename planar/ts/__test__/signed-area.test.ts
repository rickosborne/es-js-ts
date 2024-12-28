import { expect } from "chai";
import { describe, it } from "mocha";
import { signedAreaOfPolygon } from "../signed-area.js";
import { allFixtures } from "./shape-fixtures.js";

describe(signedAreaOfPolygon.name, () => {
	allFixtures.forEach(({ name, polygon, signedArea }) => {
		it(name, () => {
			expect(signedAreaOfPolygon(polygon)).closeTo(signedArea, 0.0001);
		});
	});
});
