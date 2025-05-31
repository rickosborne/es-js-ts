import { cubeRound } from "./cube-round.js";
import { cubeFromQR } from "./cube.js";
import { SQRT_3_3 } from "./hex-system.js";
import type { HexLayout, PointXY } from "./orientation.js";
import type { QRSBuilder, QRSPoint, QRSSystem } from "./qrs.js";

const MAG_2_3 = 2 / 3;

export const flatQRSFromPixel = <P extends QRSPoint<S>, S extends QRSSystem>(
	{ x, y }: { x: number; y: number },
	builder: QRSBuilder<P>,
	scale = 1,
): P => {
	const q = MAG_2_3 * x / scale;
	const r = (SQRT_3_3 * y - x / 3) / scale;
	const round = cubeRound(cubeFromQR(q, r));
	return builder(round.q, round.r);
};

export const pointyQRSFromPixel = <P extends QRSPoint<S>, S extends QRSSystem>(
	{ x, y }: { x: number; y: number },
	builder: QRSBuilder<P>,
	scale = 1,
): P => {
	const q = (SQRT_3_3 * x - y / 3) / scale;
	const r = MAG_2_3 * y / scale;
	const round = cubeRound(cubeFromQR(q, r));
	return builder(round.q, round.r);
};

export const qrsFromPixel = <P extends QRSPoint<S>, S extends QRSSystem>(
	{ x, y }: PointXY,
	{ orientation: { b0, b1, b2, b3 }, origin: { x: cx, y: cy }, size: { x: scaleX, y: scaleY } }: HexLayout,
	builder: QRSBuilder<P>,
): P => {
	const x0 = (x - cx) / scaleX;
	const y0 = (y - cy) / scaleY;
	const q = b0 * x0 + b1 * y0;
	const r = b2 * x0 + b3 * y0;
	return builder(q, r);
};
