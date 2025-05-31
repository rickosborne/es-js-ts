/**
 * Coordinates in 2D space.
 */
export type Point = {
	x: number;
	y: number;
};

/**
 * Measure of the turn of an angle, based on the order of the
 * three points which define it.
 */
// eslint-disable-next-line no-shadow
export enum Orientation {
	Counter = 1,
	Straight = 0,
	Clockwise = -1,
}

/**
 * An angle between two line segments, often as an interior angle for a polygon.
 */
export type Angle = {
	/**
	 * The {@link https://en.wikipedia.org/wiki/Signed_area | signed area} of the two segments.
	 */
	area: number;
	/**
	 * Direction of the turn, based on the order of the points used to calculate it.
	 */
	orientation: Orientation;
	/**
	 * Measure of the angle in radians.
	 */
	rad: number;
}

/**
 * Mixin which adds angle information to some other type.
 */
export type WithAngles<T extends object> = T & Angle;

/**
 * An undirected line segment joining two points.
 */
export type LineSegment = {
	blue: Point;
	gold: Point;
}

/**
 * A directed line segment joining two points in a specific order.
 */
export type DirectedSegment = {
	a: Point;
	b: Point;
}

/**
 * An ordered sequence of points.
 */
export type Path = {
	points: Point[];
}

/**
 * An ordered sequence of points, generally assuming the last point
 * connects back around to the first.
 */
export type Polygon = Path;

/**
 * A sequence of points where the interior angle at each has
 * been measured.
 */
export type PolygonWithRadians = {
	points: WithAngles<Point>[];
}

/**
 * A rectangle with no rotation.  Note that this structure does not
 * encode whether the origin point is in the bottom left (Cartesian)
 * or top left (graphics).
 */
export type Rect = Point & {
	h: number;
	w: number;
}

/**
 * An equal radius out from a center point.
 */
export type Circle = Point & {
	r: number;
}

/**
 * For algorithms which work on basic shapes.
 */
export type Shape = Polygon | Rect | Circle;

/**
 * Shorter version of {@link Orientation.Counter}.
 */
export const CCW = Orientation.Counter;
/**
 * Shorter version of {@link Orientation.Straight}.
 */
export const STRAIGHT = Orientation.Straight;
/**
 * Shorter version of {@link Orientation.Clockwise}.
 */
export const CW = Orientation.Clockwise;

/**
 * Could be an {@link Orientation}, or just a simple indication of
 * the sign of a number.
 */
export type Sign = -1 | 0 | 1;
