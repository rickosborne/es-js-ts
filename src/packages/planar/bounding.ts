import { type Circle, LineSegment, type Path, Rect, Shape } from "./2d.js";
import { isCircle, isLineSegment, isPath } from "./is-shape.js";

type PathBounds = {
	maxX: number;
	maxY: number;
	minX: number;
	minY: number;
}

/**
 * Calculate the bounding box of the given circle, meaning a minimum point
 * plus a width and height.  Note that the <kbd>x</kbd> and <kbd>y</kbd>
 * values will be the numeric minimums, which will be bottom-left in
 * Cartesian space and top-left in pixel space.
 */
export const boundingBoxOfCircle = (circle: Circle): Rect => {
	const { x, y, r } = circle;
	const d = r * 2;
	return {
		x: x - r,
		y: y - r,
		w: d,
		h: d,
	};
};

/**
 * Calculate the bounding box which would contain the points in the given path.
 */
export const boundingBoxOfPath = (path: Path): Rect => {
	if (path.points.length === 0) {
		return {
			h: Infinity,
			w: Infinity,
			x: -Infinity,
			y: -Infinity,
		};
	}
	const { minX, minY, maxX, maxY } = path.points.reduce<PathBounds>((p, c) => {
		return {
			maxX: Math.max(p.maxX, c.x),
			maxY: Math.max(p.maxY, c.y),
			minX: Math.min(p.minX, c.x),
			minY: Math.min(p.minY, c.y),
		};
	}, { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity });
	return {
		x: minX,
		y: minY,
		w: maxX - minX,
		h: maxY - minY,
	};
};

/**
 * Calculate the bounding box which would contain the given line segment.
 */
export const boundingBoxOfLineSegment = (segment: LineSegment): Rect => {
	const { blue, gold } = segment;
	const x = Math.min(blue.x, gold.x);
	const y = Math.min(blue.y, gold.y);
	const w = Math.max(blue.x, gold.x) - x;
	const h = Math.max(blue.y, gold.y) - y;
	return { h, w, x, y };
};

/**
 * Calculate the bounding box of the given shape, meaning a minimum point
 * plus a width and height.  Note that the <kbd>x</kbd> and <kbd>y</kbd>
 * values will be the numeric minimums, which will be bottom-left in
 * Cartesian space and top-left in pixel space.
 */
export const boundingBoxOf = (shape: Shape | LineSegment): Rect => {
	if (isCircle(shape)) {
		return boundingBoxOfCircle(shape);
	} else if (isPath(shape)) {
		return boundingBoxOfPath(shape);
	} else if (isLineSegment(shape)) {
		return boundingBoxOfLineSegment(shape);
	}
	return shape;
};

