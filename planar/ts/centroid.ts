import { window2 } from "@rickosborne/foundation";
import { type Point, type Polygon, boundingBoxOf } from "@rickosborne/planar";

/**
 * Calculate the centroid of a polygon, which is the weighted mean of
 * its points.  If the polygon has zero signed area, the centroid of
 * the polygon's bounding box will be returned.  The centroid is not
 * guaranteed to be within the polygon if it is not convex.
 */
export const centroidOfPolygon = (poly: Polygon): Point => {
	const { points } = poly;
	const count = points.length;
	if (count < 2) {
		return points[ 0 ];
	}
	if (count === 2) {
		return {
			x: (points[ 0 ].x + points[ 1 ].x) / 2,
			y: (points[ 0 ].y + points[ 1 ].y) / 2,
		};
	}
	let area = 0;
	let cx = 0;
	let cy = 0;
	for (const [ a, b ] of window2(points)) {
		const c = a.x * b.y - b.x * a.y;
		area += c;
		cx += ((a.x + b.x) * c);
		cy += ((a.y + b.y) * c);
	}
	if (area === 0) {
		const box = boundingBoxOf(poly);
		return {
			x: box.x + box.w / 2,
			y: box.y + box.h / 2,
		};
	}
	area *= 3;
	return {
		x: cx / area,
		y: cy / area,
	};
};
