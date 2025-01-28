import { window3, withLazyProperty } from "@rickosborne/foundation";
import type { Angle, Point, Polygon, PolygonWithRadians, WithAngles } from "./2d.js";
import { Orientation } from "./2d.js";

/**
 * Mixin for the intermediary values used for calculating angles defined
 * by the intersection of two line segments across three points: A, B, and C.
 */
export type AngleMeasures = {
	/**
	 * Change in x between A and B.
	 */
	abx: number;
	/**
	 * Change in y between A and B.
	 */
	aby: number;
	/**
	 * Change in x between B and C.
	 */
	bcx: number;
	/**
	 * Change in y between B and C.
	 */
	bcy: number;
	/**
	 * Signed area.
	 */
	area: number;
	/**
	 * Turn of the angle.
	 */
	orientation: Orientation;
}

/**
 * Calculate the intermediary values used in measuring an angle defined
 * by the intersection of two line segments along three points: A, B, and C.
 */
export const angleMeasures = (a: Point, b: Point, c: Point): AngleMeasures => {
	const abx = b.x - a.x;
	const aby = b.y - a.y;
	const bcx = c.x - b.x;
	const bcy = c.y - b.y;
	const area = abx * bcy - bcx * aby;
	const orientation = area === 0 ? Orientation.Straight : area < 0 ? Orientation.Clockwise : Orientation.Counter;
	return {
		abx,
		aby,
		area,
		bcx,
		bcy,
		orientation,
	};
};

/**
 * Given three points which define the ordered intersection of two
 * line segments, calculate the angle between them.
 */
export const measureAngle = (a: Point, b: Point, c: Point): Angle => {
	const { abx, aby, area, bcx, bcy, orientation } = angleMeasures(a, b, c);
	if ((abx === 0 && aby === 0) || (bcx === 0 && bcy === 0)) {
		return {
			area,
			orientation,
			rad: 0,
		};
	}
	return withLazyProperty({
		area,
		orientation,
	}, "rad", () => {
		const acx = c.x - a.x;
		const acy = c.y - a.y;
		const ab_ab = abx * abx + aby * aby;
		const bc_bc = bcx * bcx + bcy * bcy;
		const ac_ac = acx * acx + acy * acy;
		const ab = Math.sqrt(ab_ab);
		const bc = Math.sqrt(bc_bc);
		// noinspection UnnecessaryLocalVariableJS
		const rad = Math.acos((ab_ab + bc_bc - ac_ac) / (2 * ab * bc));
		return rad;
	});
};

/**
 * Upgrade a polygon to include angle measurements for its vertices.
 */
export const measureAngles = (poly: Polygon): PolygonWithRadians => {
	const points: WithAngles<Point>[] = [];
	for (const [ a, b, c ] of window3(poly.points)) {
		const angle = measureAngle(a, b, c);
		points.push({
			...b,
			...angle,
		});
	}
	return { points };
};
