import { intRange } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, test } from "mocha";
import { coverRect } from "../covering-grid.js";
import { cubeRound } from "../cube-round.js";
import { cubeFromQR } from "../cube.js";
import { ORIENTATION_POINTY } from "../orientation.js";
import type { HexLayout, PointXY } from "../orientation.js";
import { qrsFromPixel } from "../qrs-from-pixel.js";

describe(coverRect.name, () => {
	test("coverage", () => {
		const width = 160;
		const height = 90;
		const layout: HexLayout = {
			origin: { x: 0, y: 0 },
			orientation: ORIENTATION_POINTY,
			resolution: 0.01,
			size: { x: 16, y: 16 },
		};
		const grid = coverRect(width, height, layout);
		const pointMap = new Set<string>(grid.map(({ q, r }) => `<${ q },${ r }>`));
		const boundaryPoints: PointXY[] = [
			...intRange.from(0).by(1).toInclusive(width).toArray().map((x) => ({ x, y: 0 })),
			...intRange.from(0).by(1).toInclusive(width).toArray().map((x) => ({ x, y: height })),
			...intRange.from(0).by(1).toInclusive(height).toArray().map((y) => ({ x: 0, y })),
			...intRange.from(0).by(1).toInclusive(height).toArray().map((y) => ({ x: width, y })),
		];
		for (const point of boundaryPoints) {
			const { q, r } = cubeRound(qrsFromPixel(point, layout, cubeFromQR));
			const id = `<${ q },${ r }>`;
			expect(pointMap.has(id), `${ id } for (${ point.x },${ point.y })`).eq(true);
		}
	});
});
