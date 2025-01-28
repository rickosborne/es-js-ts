import type { LineSegment, Point, Polygon, Rect } from "./2d.js";

/**
 * Convert the given {@link Rect} to {@link Polygon} format.
 */
export const polygonFromRect = (rect: Rect): Polygon => {
	const { h, w, x, y } = rect;
	if (w === 0 && h === 0) {
		return { points: [ { x, y } ] };
	}
	if (w === 0 || h === 0) {
		return {
			points: [
				{ x, y },
				{ x: x + w, y: y + h },
			],
		};
	}
	return {
		points: [
			{ x, y },
			{ x: x + w, y },
			{ x: x + w, y: y + h },
			{ x, y: y + h },
		],
	};
};

/**
 * Convert the given {@link LineSegment} to {@link Polygon} format.
 * Arbitrarily places the left/bottom point first and right/top point second.
 */
export const polygonFromLineSegment = (segment: LineSegment): Polygon => {
	const { blue, gold } = segment;
	if (blue.x === gold.x && blue.y === gold.y) {
		return { points: [ blue ] };
	}
	let first: Point;
	let second: Point;
	if (blue.x < gold.x) {
		first = blue;
		second = gold;
	} else if (gold.x < blue.x) {
		first = gold;
		second = blue;
	} else if (blue.y < gold.y) {
		first = blue;
		second = gold;
	} else {
		first = gold;
		second = blue;
	}
	return {
		points: [ first, second ],
	};
};
