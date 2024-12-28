import { assertDefined } from "@rickosborne/guard";
import { expect } from "chai";
import { describe, it } from "mocha";
import { Angle, CCW, CW, Point, type Polygon, STRAIGHT } from "../2d.js";
import { PI, PI_2, PI_3_4, PI_4 } from "../constant.js";
import { measureAngle, measureAngles } from "../measure-angles.js";
import { ORIGIN, point, pointAdd, pointEq } from "../point.js";
import { prettyRad } from "../pretty-rad.js";
import { angle } from "../angle.js";

const ARROW_POINTS: Record<string, Point> = {
	".": ORIGIN,
	"←": point(-1, 0),
	"↑": point(0, 1),
	"→": point(1, 0),
	"↓": point(0, -1),
	"↖": point(-1, 1),
	"↗": point(1, 1),
	"↘": point(1, -1),
	"↙": point(-1, -1),
	"⇒": point(2, 0),
};

const examples: [ label: string, mid: Angle ][] = [
	[ "→↑", angle(1, CCW, PI_2) ],
	[ "↑→", angle(-1, CW, PI_2) ],
	[ "→↘", angle(-1, CW, PI_3_4) ],
	[ "→↖", angle(1, CCW, PI_4) ],
	[ "⇒↖", angle(2, CCW, PI_4) ],
	[ "→↗", angle(1, CCW, PI_3_4) ],
	[ "→↙", angle(-1, CW, PI_4) ],
	[ "⇒↙", angle(-2, CW, PI_4) ],
	[ "→↓", angle(-1, CW, PI_2) ],
	[ "↓→", angle(1, CCW, PI_2) ],
	[ "←↓", angle(1, CCW, PI_2) ],
	[ "↓←", angle(-1, CW, PI_2) ],
	[ "→→", angle(0, STRAIGHT, PI) ],
];

const makePoints = (arrows: string): [ Point, Point, Point ] => {
	const a = ORIGIN;
	const bArrow = arrows.charAt(0);
	const bStep = ARROW_POINTS[ bArrow ];
	assertDefined(bStep, () => `bStep: ${ bArrow }`);
	const b = pointAdd(a, bStep);
	const cArrow = arrows.charAt(1);
	const cStep = ARROW_POINTS[ cArrow ];
	assertDefined(cStep, () => `cStep: ${ cArrow }`);
	const c = pointAdd(b, cStep);
	return [ a, b, c ];
};

describe(measureAngle.name, () => {
	for (const [ label, angle ] of examples) {
		it(label, () => {
			const [ a, b, c ] = makePoints(label);
			const actual = measureAngle(a, b, c);
			expect(actual.area, "area").closeTo(angle.area, 0.0001);
			expect(actual.orientation, "orientation").eq(angle.orientation);
			expect(actual.rad, "rad").closeTo(angle.rad, 0.0001);
		});
	}
});

describe(measureAngles.name, () => {
	for (const [ label, angle ] of examples) {
		it(label, () => {
			const [ a, b, c ] = makePoints(label);
			const radA = Math.atan2(Math.abs(c.y), Math.abs(c.x));
			const radC = PI - radA - angle.rad;
			const withoutAngles: Polygon = { points: [ a, b, c ] };
			const poly = measureAngles(withoutAngles);
			expect(poly.points.every((p, n) => pointEq(p, withoutAngles.points[ n ])));
			const [ angleA, angleB, angleC ] = poly.points;
			expect(prettyRad(angleA.rad), "A.rad").eq(prettyRad(radA));
			expect(prettyRad(angleB.rad), "B.rad").eq(prettyRad(angle.rad));
			expect(angleB.area, "B.area").closeTo(angle.area, 0.0001);
			expect(angleB.orientation, "B.orientation").eq(angle.orientation);
			expect(prettyRad(angleC.rad), "C.rad").eq(prettyRad(radC));
		});
	}
});
