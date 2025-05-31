import { minMax, roundTo } from "@rickosborne/foundation";
import { cubeRound } from "./cube-round.js";
import { cubeFromQR } from "./cube.js";
import { hexContainsChecker } from "./hex-contains-point.js";
import type { HexLayout, PointXY } from "./orientation";
import { hexCorners, pixelFromQRS } from "./pixel-from-qrs.js";
import { qrsFromPixel } from "./qrs-from-pixel.js";
import type { BareQRSPoint } from "./qrs.js";

export interface QRWithXY extends PointXY, BareQRSPoint {
	corners: PointXY[];
}

/**
 * Generate a hex grid which completely covers a rectangle of the
 * given dimensions.
 */
export const coverRect = (
	width: number,
	height: number,
	layout: HexLayout,
): QRWithXY[] => {
	const rectCorners: PointXY[] = [
		{ x: 0, y: 0 },
		{ x: width, y: 0 },
		{ x: width, y: height },
		{ x: 0, y: height },
	];
	const cubeCorners = rectCorners.map((xy) => cubeRound(qrsFromPixel(xy, layout, cubeFromQR)));
	const points: QRWithXY[] = [];
	const [ rMin, rMax ] = minMax(cubeCorners.map(({ r }) => r));
	const [ qMin, qMax ] = minMax(cubeCorners.map(({ q }) => q));
	const originCube = cubeCorners[ 0 ]!;
	const hexContains = hexContainsChecker(hexCorners(originCube, layout));
	const inRect = (p: PointXY) => p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
	const rectIn = ({ x: px, y: py }: PointXY): boolean => rectCorners.some(({ x: rcx, y: rcy }) => hexContains({ x: rcx - px, y: rcy - py }));
	for (let q = qMin; q <= qMax; q++) {
		for (let r = rMin; r <= rMax; r++) {
			const px = pixelFromQRS({ q, r }, layout);
			const corners = hexCorners({ q, r }, layout);
			if (corners.some(inRect) || rectIn(px)) {
				points.push({ corners, q, r, x: px.x, y: px.y });
			}
		}
	}
	return points;
};

/**
 * Build a rudimentary SVG for the described grid.  Intended more
 * for testing and visual inspection than for anything significant.
 */
export const svgForHexGrid = (grid: { height: number; hexes: QRWithXY[]; width: number }, layout: HexLayout): string => {
	const { height, hexes, width } = grid;
	const { resolution } = layout;
	const lines: string[] = [
		`<svg width="${ width }" height="${ height }" viewBox="0 0 ${ width } ${ height }" xmlns="http://www.w3.org/2000/svg">`,
		`<style>path { fill: #FFFFFF; stroke: #000000; stroke-width: 1; }</style>`,
	];
	for (const hex of hexes) {
		const path = [
			"M",
			roundTo(hex.corners[ 0 ]!.x, resolution),
			roundTo(hex.corners[ 0 ]!.y, resolution),
			...hex.corners.slice(1).map(({ x, y }) => `L ${ roundTo(x, resolution) },${ roundTo(y, resolution) }`),
			"Z",
		].join(" ");
		lines.push(`<path d="${ path }" id="q-${ hex.q }-r-${ hex.r }" />`);
	}
	lines.push("</svg>");
	return lines.join("\n");
};
