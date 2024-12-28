import { window2 } from "@rickosborne/foundation";
import { Polygon } from "@rickosborne/planar";

/**
 * Calculate the {@link https://en.wikipedia.org/wiki/Signed_area | signed area} of a polygon.
 */
export const signedAreaOfPolygon = (
	poly: Polygon,
): number => {
	let sum = 0;
	for (const [ a, b ] of window2(poly.points)) {
		sum += (a.x * b.y - b.x * a.y);
	}
	return sum / 2;
};
