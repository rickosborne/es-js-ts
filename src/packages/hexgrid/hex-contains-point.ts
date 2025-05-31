import { BetterMap } from "@rickosborne/foundation";
import { type PointXY } from "./orientation.js";

/**
 * Build a function which can check to see if the given pixel coordinates
 * would be contained by the hex described by the corners.  To be useful,
 * cache this function, and then call it with pixel coordinates translated
 * to the original hex's center.
 */
export const hexContainsChecker = (corners: PointXY[]): (xy: PointXY) => boolean => {
	const { maxX, maxY, minX, minY, xs } = corners.slice(1).reduce((p, { x: rx, y: ry }) => {
		if (rx < p.minX) p.minX = rx;
		if (rx > p.maxX) p.maxX = rx;
		if (ry < p.minY) p.minY = ry;
		if (ry > p.maxY) p.maxY = ry;
		p.xs.upsert(rx, (e) => rx + (e ?? 0));
		return p;
	}, { minX: corners[ 0 ]!.x, maxX: corners[ 0 ]!.x, minY: corners[ 0 ]!.y, maxY: corners[ 0 ]!.y, xs: BetterMap.empty<number, number>() });
	const isFlat = xs.get(minX) === 1;
	let rectMinX: number = isFlat ? Infinity : minX;
	let rectMaxX: number = isFlat ? -Infinity : maxX;
	let rectMinY: number = isFlat ? minY : Infinity;
	let rectMaxY: number = isFlat ? maxY : -Infinity;
	const triangleCheckers: ((xy: PointXY) => boolean)[] = [];
	for (const corner of corners) {
		const { x: cx, y: cy } = corner;
		if ((isFlat && (cy === minY || cy === maxY))) {
			if (cx < rectMinX) rectMinX = cx;
			if (cx > rectMaxX) rectMaxX = cx;
		} else if (!isFlat && (cx === minX || cx === maxX)) {
			if (cy < rectMinY) rectMinY = cy;
			if (cy > rectMaxY) rectMaxY = cy;
		} else if (cx < rectMinX) {
			// Flat, left
			triangleCheckers.push(triangleContainsChecker([ corner, { x: rectMinX, y: maxY }, { x: rectMinX, y: minY } ]));
		} else if (cx > rectMaxX) {
			// Flat, right
			triangleCheckers.push(triangleContainsChecker([ corner, { x: rectMaxX, y: maxY }, { x: rectMaxX, y: minY } ]));
		} else if (cy < rectMinY) {
			// Pointy, bottom
			triangleCheckers.push(triangleContainsChecker([ corner, { x: rectMinX, y: rectMinY }, { x: rectMaxX, y: rectMinY } ]));
		} else if (cy > rectMaxY) {
			// Pointy, top
			triangleCheckers.push(triangleContainsChecker([ corner, { x: rectMinX, y: rectMaxY }, { x: rectMaxX, y: rectMaxY } ]));
		} else {
			throw new Error("Odd hex corners?");
		}
	}
	return (xy: PointXY): boolean => {
		const { x, y } = xy;
		// Is it outside the bounding box?
		if (x < minX || x > maxX || y < minY || y > maxY) {
			return false;
		}
		// Is it inside the center rectangle?
		if (x >= rectMinX && x <= rectMaxX && y >= rectMinY && y <= rectMaxY) {
			return true;
		}
		// Is it inside the leftover points?
		return triangleCheckers.some((checkTriangle) => checkTriangle(xy));
	};
};

export const hexCornersContainPoint = (corners: PointXY[], xy: PointXY): boolean => {
	return hexContainsChecker(corners)(xy);
};

/**
 * Generate a function which can check to see if a given point is inside
 * the triangle described by the three points.
 */
export const triangleContainsChecker = (triangle: [ PointXY, PointXY, PointXY ]): (xy: PointXY) => boolean => {
	const [ { x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 } ] = triangle;
	const x1x3 = x1 - x3;
	const x3x2 = x3 - x2;
	const y2y3 = y2 - y3;
	const y3y1 = y3 - y1;
	const d = y2y3 * x1x3 + x3x2 * (y1 - y3);
	const y2y3d = y2y3 / d;
	const x3x2d = x3x2 / d;
	const y3y1d = y3y1 / d;
	const x1x3d = x1x3 / d;
	return ({ x: px, y: py }: PointXY) => {
		const a = y2y3d * (px - x3) + x3x2d * (py - y3);
		const b = y3y1d * (px - x3) + x1x3d * (py - y3);
		const c = 1 - a - b;
		return (a >= 0) && (a <= 1) && (b >= 0) && (b <= 1) && (c >= 0) && (c <= 1);
	};
};

export const triangleContainsPoint = (triangle: [ PointXY, PointXY, PointXY ], point: PointXY): boolean => {
	// Barycentric version of the algorithm.
	return triangleContainsChecker(triangle)(point);
};
