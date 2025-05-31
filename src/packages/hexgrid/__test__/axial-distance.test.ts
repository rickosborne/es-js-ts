import { expect } from "chai";
import { describe, test } from "mocha";
import { AXIAL_FLAT_N, AXIAL_FLAT_NE, AXIAL_FLAT_NW, AXIAL_FLAT_S, AXIAL_FLAT_SE, AXIAL_FLAT_SW, AXIAL_ORIGIN, AXIAL_POINTY_E, AXIAL_POINTY_NE, AXIAL_POINTY_NW, AXIAL_POINTY_SE, AXIAL_POINTY_SW, AXIAL_POINTY_W, axialFromQR } from "../axial.js";
import { CUBE_ORIGIN, cubeFromQR } from "../cube.js";
import { hexDistance, hexEuclidDistance } from "../hex-distance.js";
import { SQRT_3 } from "../hex-system.js";

describe("hex distance", () => {
	test(hexDistance.name, () => {
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_N)).eq(1);
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_NE)).eq(1);
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_NW)).eq(1);
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_S)).eq(1);
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_SE)).eq(1);
		expect(hexDistance(AXIAL_ORIGIN, AXIAL_FLAT_SW)).eq(1);

		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_E)).eq(1);
		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_NE)).eq(1);
		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_NW)).eq(1);
		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_W)).eq(1);
		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_SE)).eq(1);
		expect(hexDistance(CUBE_ORIGIN, AXIAL_POINTY_SW)).eq(1);
	});
	test(hexEuclidDistance.name, () => {
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_N), "Flat N").eq(1);
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_NE), "Flat NE").eq(1);
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_NW), "Flat NW").eq(1);
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_S), "Flat S").eq(1);
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_SE), "Flat SE").eq(1);
		expect(hexEuclidDistance(AXIAL_ORIGIN, AXIAL_FLAT_SW), "Flat SW").eq(1);

		expect(hexEuclidDistance(AXIAL_ORIGIN, axialFromQR(2, -1)), "Diag E").eq(SQRT_3);
		expect(hexEuclidDistance(AXIAL_ORIGIN, axialFromQR(1, 1)), "Diag SE").eq(SQRT_3);
		expect(hexEuclidDistance(AXIAL_ORIGIN, axialFromQR(-1, 2)), "Diag SW").eq(SQRT_3);
		expect(hexEuclidDistance(AXIAL_ORIGIN, cubeFromQR(-2, 1)), "Diag W").eq(SQRT_3);
		expect(hexEuclidDistance(AXIAL_ORIGIN, cubeFromQR(-1, -1)), "Diag NW").eq(SQRT_3);
		expect(hexEuclidDistance(AXIAL_ORIGIN, cubeFromQR(1, -2)), "Diag NE").eq(SQRT_3);
	});
});
