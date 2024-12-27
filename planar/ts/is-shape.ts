import { hasArray, hasNumber, hasOwn } from "@rickosborne/guard";
import type { Circle, DirectedSegment, LineSegment, Path, Point, Rect } from "./2d.js";

/**
 * Guard for whether the given value has <kbd>x</kbd> and <kbd>y</kbd> coordinates.
 * May have more!
 */
export const isPoint = (obj: unknown): obj is Point => {
	return hasNumber(obj, "x") && hasNumber(obj, "y");
};

/**
 * Guard for whether the given value has <kbd>x</kbd> and <kbd>y</kbd> coordinates
 * plus <kbd>w</kbd> and <kbd>h</kbd> measures.
 * May have more!
 */
export const isRect = (obj: unknown): obj is Rect => {
	return isPoint(obj) && hasNumber(obj, "w") && hasNumber(obj, "h");
};

/**
 * Guard for whether the given value has a list of points.  It will not
 * exhaustively check the points for validity unless <kbd>deep</kbd> is true.
 */
export const isPath = (obj: unknown, deep = false): obj is Path => {
	return hasArray(obj, "points", deep ? isPoint : undefined);
};

/**
 * Guard for whether the given value has <kbd>x</kbd> and <kbd>y</kbd> coordinates
 * plus a radius <kbd>r</kbd> measure.
 * May have more!
 */
export const isCircle = (obj: unknown): obj is Circle => {
	return isPoint(obj) && hasNumber(obj, "r");
};

/**
 * Guard for whether the given value has <kbd>blue</kbd> and <kbd>gold</kbd>
 * {@link Point} properties.  May have more!
 */
export const isLineSegment = (obj: unknown): obj is LineSegment => {
	return hasOwn(obj, "blue", isPoint)
		&& hasOwn(obj, "gold", isPoint);
};

/**
 * Guard for whether the given value has <kbd>a</kbd> and <kbd>b</kbd>
 * {@link Point} properties.  May have more!
 */
export const isDirectedSegment = (obj: unknown): obj is DirectedSegment => {
	return hasOwn(obj, "a", isPoint)
		&& hasOwn(obj, "b", isPoint);
};
