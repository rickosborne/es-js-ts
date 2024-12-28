import { CCW, CW, Orientation, Point, Polygon, STRAIGHT } from "../2d.js";
import { SQRT_2, SQRT_5 } from "../constant.js";

export type ShapeFixture = {
	centroid: Point;
	name: string;
	orientation: Orientation;
	polygon: Polygon;
	perimeter: number;
	signedArea: number;
} & ({
	badPoints?: undefined;
	convex: true;
} | {
	badPoints: number[];
	convex: false;
});

export const fixtures = {
	envelopeCCW: {
		badPoints: [ 3 ],
		centroid: { x: 1, y: 7 / 9 },
		convex: false,
		name: "envelopeCCW",
		orientation: CCW,
		perimeter: 6 + 2 * SQRT_2,
		polygon: {
			points: [
				{ x: 0, y: 0 },
				{ x: 2, y: 0 },
				{ x: 2, y: 2 },
				{ x: 1, y: 1 },
				{ x: 0, y: 2 },
			],
		},
		signedArea: 3,
	},
	envelopeCW: {
		badPoints: [ 2 ],
		centroid: { x: 1, y: 7 / 9 },
		convex: false,
		name: "envelopeCW",
		orientation: CW,
		perimeter: 6 + 2 * SQRT_2,
		polygon: {
			points: [
				{ x: 0, y: 0 },
				{ x: 0, y: 2 },
				{ x: 1, y: 1 },
				{ x: 2, y: 2 },
				{ x: 2, y: 0 },
			],
		},
		signedArea: -3,
	},
	infinityCCW: {
		badPoints: [ 2, 3, 4 ],
		centroid: { x: 2, y: 1 },
		convex: false,
		name: "infinityCCW",
		orientation: STRAIGHT,
		perimeter: 8 * SQRT_2,
		polygon: {
			points: [
				{ x: 0, y: 1 },
				{ x: 1, y: 0 },
				{ x: 3, y: 2 },
				{ x: 4, y: 1 },
				{ x: 3, y: 0 },
				{ x: 1, y: 2 },
			],
		},
		signedArea: 0,
	},
	infinityCW: {
		badPoints: [ 2, 3, 4 ],
		centroid: { x: 2, y: 1 },
		convex: false,
		name: "infinityCW",
		orientation: STRAIGHT,
		perimeter: 8 * SQRT_2,
		polygon: {
			points: [
				{ x: 0, y: 1 },
				{ x: 1, y: 2 },
				{ x: 3, y: 0 },
				{ x: 4, y: 1 },
				{ x: 3, y: 2 },
				{ x: 1, y: 0 },
			],
		},
		signedArea: 0,
	},
	parallelogramCCW: {
		centroid: { x: 3, y: 3 },
		convex: true,
		name: "parallelogramCCW",
		orientation: CCW,
		perimeter: 4 * Math.sqrt(10),
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 4, y: 2 },
				{ x: 5, y: 5 },
				{ x: 2, y: 4 },
			],
		},
		signedArea: 8,
	},
	parallelogramCW: {
		centroid: { x: 3, y: 3 },
		convex: true,
		name: "parallelogramCW",
		orientation: CW,
		perimeter: 4 * Math.sqrt(10),
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 2, y: 4 },
				{ x: 5, y: 5 },
				{ x: 4, y: 2 },
			],
		},
		signedArea: -8,
	},
	squareCCW: {
		centroid: { x: 3, y: 3 },
		convex: true,
		name: "squareCCW",
		orientation: CCW,
		perimeter: 16,
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 5, y: 1 },
				{ x: 5, y: 5 },
				{ x: 1, y: 5 },
			],
		},
		signedArea: 16,
	},
	squareCW: {
		centroid: { x: 3, y: 3 },
		convex: true,
		name: "squareCW",
		orientation: CW,
		perimeter: 16,
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 1, y: 5 },
				{ x: 5, y: 5 },
				{ x: 5, y: 1 },
			],
		},
		signedArea: -16,
	},
	triangleCCW: {
		centroid: { x: 2, y: 2 },
		convex: true,
		name: "triangleCCW",
		orientation: CCW,
		perimeter: SQRT_5 + SQRT_2 + SQRT_5,
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 3, y: 2 },
				{ x: 2, y: 3 },
			],
		},
		signedArea: 1.5,
	},
	triangleCW: {
		centroid: { x: 2, y: 2 },
		convex: true,
		name: "triangleCW",
		orientation: CW,
		perimeter: SQRT_5 + SQRT_2 + SQRT_5,
		polygon: {
			points: [
				{ x: 1, y: 1 },
				{ x: 2, y: 3 },
				{ x: 3, y: 2 },
			],
		},
		signedArea: -1.5,
	},
} satisfies Record<string, ShapeFixture>;

export const allFixtures: ShapeFixture[] = Object.values(fixtures);