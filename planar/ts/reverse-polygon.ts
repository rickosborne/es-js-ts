import { hasNumber } from "@rickosborne/guard";
import { Polygon } from "./2d.js";

/**
 * Reverse the point order of a polygon, while keeping the starting
 * point the same.
 */
export const reversePolygon = <P extends Polygon>(poly: P): P => {
	if (poly.points.length < 2) {
		return poly;
	}
	const newPoints = poly.points.slice(1).reverse();
	newPoints.unshift(poly.points[ 0 ]);
	return {
		...poly,
		points: newPoints.map((p) => {
			if (hasNumber(p, "orientation")) {
				return {
					...p,
					orientation: -p.orientation,
				};
			}
			return p;
		}),
	};
};
