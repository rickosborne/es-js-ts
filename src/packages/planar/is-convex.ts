import { window3 } from "@rickosborne/foundation";
import type { Either } from "@rickosborne/typical";
import type { Orientation, Polygon , Sign } from "./2d.js";
import { CCW, CW, STRAIGHT } from "./2d.js";
import { angleMeasures } from "./measure-angles.js";

type SignTracker = {
	first: Sign;
	flips: number;
	last: Sign;
}

/**
 * Used by {@link fastIsConvex}, this keeps track of sign flips.
 * @returns `false` if the flip count is too high
 */
const trackSign = (tracker: SignTracker, value: number): boolean => {
	const { last } = tracker;
	if (value > 0) {
		if (last === 0) {
			tracker.first = 1;
		} else if (last < 1) {
			tracker.flips++;
		}
		tracker.last = 1;
	} else if (value < 0) {
		if (last === 0) {
			tracker.first = -1;
		} else if (last > 0) {
			tracker.flips++;
		}
		tracker.last = -1;
	}
	return tracker.flips <= 2;
};

/**
 * Result of a calculation of whether a polygon is convex indicating
 * the polygon is complex.
 */
export type ConvexWithOrientation = {
	convex: true;
	orientation: Orientation.Counter | Orientation.Clockwise;
};

/**
 * Result of a calculation of whether a polygon is convex, indicating
 * that it does not seem to be, or is still unknown.
 */
export type NotConvex = {
	badPoints?: number[];
	convex: false;
	firstOrientation?: Orientation | undefined;
	overallOrientation?: Orientation | undefined;
};

/**
 * Result of a calculation of whether a polygon is convex.
 */
export type IsConvex = Either<ConvexWithOrientation, NotConvex>;

/**
 * Basic shared value for a true {@link IsConvex} result with a
 * clockwise orientation.
 */
export const CONVEX_TRUE_CW: IsConvex = Object.freeze({
	convex: true,
	orientation: CW,
});

/**
 * Basic shared value for a true {@link IsConvex} result with a
 * counterclockwise orientation.
 */
export const CONVEX_TRUE_CCW: IsConvex = Object.freeze({
	convex: true,
	orientation: CCW,
});

/**
 * Performs a rudimentary check of a polygon, calculating angles at each
 * vertex and checking for sign flips in the line segment cross products.
 * The result may not be reliable for symmetric shapes where the signed
 * areas cancel out.  This version also does not track "bad" points.
 */
export const fastIsConvex = (poly: Polygon): boolean => {
	const { points } = poly;
	const count = points.length;
	if (count < 3) {
		return false;
	}
	let wSign: Sign = 0;
	const xSign: SignTracker = { first: 0, flips: 0, last: 0 };
	const ySign: SignTracker = { first: 0, flips: 0, last: 0 };
	for (const [ back, mid, forward ] of window3(points)) {
		const { bcx, bcy, orientation } = angleMeasures(back, mid, forward);
		if (!trackSign(xSign, bcx)) {
			return false;
		}
		if (!trackSign(ySign, bcy)) {
			return false;
		}
		if (orientation === STRAIGHT) {
			// do nothing
		} else if (wSign === 0) {
			wSign = orientation;
		} else if (wSign !== orientation) {
			return false;
		}
	}
	if (xSign.last !== 0 && xSign.first !== 0 && xSign.last !== xSign.first) {
		xSign.flips++;
	}
	if (ySign.last !== 0 && ySign.first !== 0 && ySign.last !== ySign.first) {
		ySign.flips++;
	}
	return (xSign.flips === 2 && ySign.flips === 2);
};

/**
 * More detailed check to see if a polygon is convex.  Tracks "bad"
 * points and returns them if found.  Slower than {@link fastIsConvex},
 * and doesn't necessarily return a better result, though it may give more
 * information in scenarios where you want to try to split the polygon
 * into smaller convex polygons.
 */
export const detailedIsConvex = (poly: Polygon): IsConvex => {
	const cw: number[] = [];
	const ccw: number[] = [];
	let signedArea = 0;
	// This is used for tie-breakers if the overall is STRAIGHT.
	let firstOrientation: Orientation | undefined = undefined;
	for (const [ a, b, c, , i ] of window3(poly.points)) {
		const { orientation } = angleMeasures(a, b, c);
		if (orientation === CW) {
			cw.push(i);
			firstOrientation ??= CW;
		} else if (orientation === CCW) {
			ccw.push(i);
			firstOrientation ??= CCW;
		}
		signedArea += (a.x * b.y - b.x * a.y);
	}
	const overallOrientation = signedArea === 0 ? STRAIGHT : signedArea < 0 ? CW : CCW;
	if ((cw.length === 0 && ccw.length === 0) || overallOrientation === STRAIGHT) {
		return { badPoints: [], convex: false, firstOrientation, overallOrientation };
	}
	if (cw.length === ccw.length) {
		return { badPoints: overallOrientation === CCW ? cw : ccw, convex: false, firstOrientation, overallOrientation };
	}
	if (cw.length > ccw.length) {
		if (ccw.length > 0) {
			return { badPoints: ccw, convex: false, firstOrientation, overallOrientation };
		}
		return CONVEX_TRUE_CW;
	}
	if (cw.length > 0) {
		return { badPoints: cw, convex: false, firstOrientation, overallOrientation };
	}
	return CONVEX_TRUE_CCW;
};
