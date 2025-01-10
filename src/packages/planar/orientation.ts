import { Orientation, Polygon } from "./2d.js";
import { signedAreaOfPolygon } from "./signed-area.js";

/**
 * Calculate the orientation of a polygon as defined by the order
 * of its points and its signed area.  This does not necessarily
 * imply the polygon is convex.  This version uses Cartesian
 * coordinates, where the origin is in the bottom left.
 * See also {@link gfxOrientationOfPolygon}.
 */
export const cartesianOrientationOfPolygon = (poly: Polygon): Orientation => {
	const area = signedAreaOfPolygon(poly);
	if (area === 0) {
		return Orientation.Straight;
	}
	return area < 0 ? Orientation.Clockwise : Orientation.Counter;
};

/**
 * Calculate the orientation of a polygon as defined by the order
 * of its points and its signed area.  This does not necessarily
 * imply the polygon is convex.  This version uses graphics
 * coordinates, where the origin is in the top left.
 * See also {@link cartesianOrientationOfPolygon}.
 */
export const gfxOrientationOfPolygon = (poly: Polygon): Orientation => {
	const cartesian = cartesianOrientationOfPolygon(poly);
	if (cartesian === Orientation.Straight) {
		return Orientation.Straight;
	}
	return cartesian === Orientation.Counter ? Orientation.Clockwise : Orientation.Counter;
};
