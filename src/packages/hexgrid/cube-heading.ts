import { cubeSubtract } from "./cube-subtract.js";
import { CUBE_NE, CUBE_SW, type HexCubeDirection, type HexCubePoint } from "./cube.js";
import { CUBE_FLAT_N, CUBE_FLAT_NW, CUBE_FLAT_S, CUBE_FLAT_SE } from "./cube.js";

export const cubeHeading = (from: HexCubePoint, toward: HexCubePoint): HexCubeDirection | undefined => {
	const { q, r, s } = cubeSubtract(toward, from);
	if (q === 0 && r === 0 && s === 0) {
		return undefined;
	}
	const sq = Math.abs(s - q);
	const rs = Math.abs(r - s);
	const qr = Math.abs(q - r);
	const max = Math.max(sq, rs, qr);
	if (rs === max) {
		if ((r - s) < 0) {
			return CUBE_FLAT_N;
		}
		return CUBE_FLAT_S;
	}
	if (sq === max) {
		if ((s - q) < 0) {
			return CUBE_FLAT_SE;
		}
		return CUBE_FLAT_NW;
	}
	if ((q - r) < 0) {
		return CUBE_SW;
	}
	return CUBE_NE;
};
