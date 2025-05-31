import { expect } from "chai";
import { describe, it } from "mocha";
import { cubeHeading } from "../cube-heading.js";
import { type BareHexCubePoint, CUBE_FLAT_N, CUBE_FLAT_NW, CUBE_FLAT_S, CUBE_FLAT_SE, CUBE_NE, CUBE_ORIGIN, CUBE_SW, type HexCubeDirection, stringifyCube } from "../cube.js";
import { CUBE } from "../hex-system.js";

const expectations: [ BareHexCubePoint, BareHexCubePoint, HexCubeDirection | undefined ][] = [
	// [ { q: 1, r: 1, s: -2 }, { q: 1, r: 1, s: -2 }, undefined ],
	[ CUBE_ORIGIN, { q: 2, r: 0, s: -2 }, CUBE_FLAT_SE ],
	[ CUBE_ORIGIN, { q: 1, r: 2, s: -3 }, CUBE_FLAT_S ],
	[ CUBE_ORIGIN, { q: -3, r: 2, s: 1 }, CUBE_SW ],
	[ CUBE_ORIGIN, { q: -4, r: 1, s: 3 }, CUBE_FLAT_NW ],
	[ CUBE_ORIGIN, { q: 1, r: -2, s: 1 }, CUBE_FLAT_N ],
	[ CUBE_ORIGIN, { q: 4, r: -4, s: 0 }, CUBE_NE ],
];

describe(cubeHeading.name, () => {
	expectations.forEach(([ left, right, heading ]) => {
		it(`${ stringifyCube(left) } -> ${ stringifyCube(right) } => ${ heading == null ? "<undef>" : stringifyCube(heading) }`, () => {
			expect(cubeHeading({ ...left, system: CUBE }, { ...right, system: CUBE })).equals(heading);
		});
	});
});
