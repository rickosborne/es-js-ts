import { expect } from "chai";
import { describe, it } from "mocha";
import { EPSILON } from "../constant.js";
import { perimeterOfPolygon } from "../perimeter.js";
import { allFixtures } from "./shape-fixtures.js";

describe(perimeterOfPolygon.name, () => {
	allFixtures.forEach(({ name, perimeter, polygon }) => {
		it(name, () => {
			expect(perimeterOfPolygon(polygon)).closeTo(perimeter, EPSILON);
		});
	});
});
