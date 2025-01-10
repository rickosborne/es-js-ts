import { describe, it } from "mocha";
import { expect } from "chai";
import { measureAngles } from "../measure-angles.js";
import { reversePolygon } from "../reverse-polygon.js";
import { fixtures } from "./shape-fixtures.js";

describe(reversePolygon.name, () => {
	it("keeps the first point the same", () => {
		const original = fixtures.squareCW.polygon;
		const count = original.points.length;
		const reversed = reversePolygon(original);
		expect(reversed.points.length, "count").eq(count);
		expect(reversed.points[0], "head").eq(original.points[0]);
		for (let i = 1; i < count; i++) {
			const j = count - i;
			expect(reversed.points[i], String(i)).eq(original.points[j]);
		}
	});
	it("returns the original polygon for fewer than 2 points", () => {
		const empty = { points:[] };
		const one = { points:[ { x: 1, y: 2 } ] };
		expect(reversePolygon(empty)).eq(empty);
		expect(reversePolygon(one)).eq(one);
	});
	it("reverses the orientation if present", () => {
		const measured = measureAngles({
			points: fixtures.squareCW.polygon.points.slice(),
		});
		const reversed = reversePolygon(measured);
		for (let i = 0; i < 4; i++) {
			const original = measured.points[i]!;
			const flipped = reversed.points[i === 0 ? 0 : (4 - i)]!;
			const expected = {
				...original,
				orientation: -original.orientation,
			};
			expect(flipped, String(i)).eql(expected);
		}
	});
});
