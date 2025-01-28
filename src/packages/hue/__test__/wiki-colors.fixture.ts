import { window2 } from "@rickosborne/foundation";
import { toReal01 } from "@rickosborne/rebound";
import type { ItemType } from "@rickosborne/typical";
import { A_GT_B, A_LT_B, EQ } from "@rickosborne/typical";
import { expect } from "chai";
import type { UnbrandedNumbers } from "../color-comparator.js";
import { toHSL } from "../hsl.js";
import { toHSV } from "../hsv.js";
import { toRGB } from "../rgb.js";

/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
 */
export const WIKI_COLORS = ([
	// Color 	R 	G 	B 	H 	H2 	C 	C2 	V 	L 	I 	Y′601 	SHSV 	SHSL 	SHSI
	[ "#FFFFFF", 1.000, 1.000, 1.000, undefined, undefined, 0.000, 0.000, 1.000, 1.000, 1.000, 1.000, 0.000, 0.000, 0.000 ],
	[ "#808080", 0.500, 0.500, 0.500, undefined, undefined, 0.000, 0.000, 0.500, 0.500, 0.500, 0.500, 0.000, 0.000, 0.000 ],
	[ "#000000", 0.000, 0.000, 0.000, undefined, undefined, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000 ],
	[ "#FF0000", 1.000, 0.000, 0.000, 0.0, 0.0, 1.000, 1.000, 1.000, 0.500, 0.333, 0.299, 1.000, 1.000, 1.000 ],
	[ "#BFBF00", 0.750, 0.750, 0.000, 60.0, 60.0, 0.750, 0.750, 0.750, 0.375, 0.500, 0.664, 1.000, 1.000, 1.000 ],
	[ "#008000", 0.000, 0.500, 0.000, 120.0, 120.0, 0.500, 0.500, 0.500, 0.250, 0.167, 0.293, 1.000, 1.000, 1.000 ],
	[ "#80FFFF", 0.500, 1.000, 1.000, 180.0, 180.0, 0.500, 0.500, 1.000, 0.750, 0.833, 0.850, 0.500, 1.000, 0.400 ],
	[ "#8080FF", 0.500, 0.500, 1.000, 240.0, 240.0, 0.500, 0.500, 1.000, 0.750, 0.667, 0.557, 0.500, 1.000, 0.250 ],
	[ "#BF40BF", 0.750, 0.250, 0.750, 300.0, 300.0, 0.500, 0.500, 0.750, 0.500, 0.583, 0.457, 0.667, 0.500, 0.571 ],
	[ "#A0A424", 0.628, 0.643, 0.142, 61.8, 61.5, 0.501, 0.494, 0.643, 0.393, 0.471, 0.581, 0.779, 0.638, 0.699 ],
	[ "#411BEA", 0.255, 0.104, 0.918, 251.1, 250.0, 0.814, 0.750, 0.918, 0.511, 0.426, 0.242, 0.887, 0.832, 0.756 ],
	[ "#1EAC41", 0.116, 0.675, 0.255, 134.9, 133.8, 0.559, 0.504, 0.675, 0.396, 0.349, 0.460, 0.828, 0.707, 0.667 ],
	[ "#F0C80E", 0.941, 0.785, 0.053, 49.5, 50.5, 0.888, 0.821, 0.941, 0.497, 0.593, 0.748, 0.944, 0.893, 0.911 ],
	[ "#B430E5", 0.704, 0.187, 0.897, 283.7, 284.8, 0.710, 0.636, 0.897, 0.542, 0.596, 0.423, 0.792, 0.775, 0.686 ],
	[ "#ED7651", 0.931, 0.463, 0.316, 14.3, 13.2, 0.615, 0.556, 0.931, 0.624, 0.570, 0.586, 0.661, 0.817, 0.446 ],
	[ "#FEF888", 0.998, 0.974, 0.532, 56.9, 57.4, 0.466, 0.454, 0.998, 0.765, 0.835, 0.931, 0.467, 0.991, 0.363 ],
	[ "#19CB97", 0.099, 0.795, 0.591, 162.4, 163.4, 0.696, 0.620, 0.795, 0.447, 0.495, 0.564, 0.875, 0.779, 0.800 ],
	[ "#362698", 0.211, 0.149, 0.597, 248.3, 247.3, 0.448, 0.420, 0.597, 0.373, 0.319, 0.219, 0.750, 0.601, 0.533 ],
	[ "#7E7EB8", 0.495, 0.493, 0.721, 240.5, 240.4, 0.228, 0.227, 0.721, 0.607, 0.570, 0.520, 0.316, 0.290, 0.135 ],
] as [
	hex: string,
	r01: number,
	g01: number,
	b01: number,
	h1_360: number | undefined,
	h2_360: number | undefined,
	c1_01: number,
	c2_02: number,
	val01: number,
	lum01: number,
	int01: number,
	y601: number,
	sv01: number,
	sl01: number,
	si01: number,
][]).map(([ hex, r01, g01, b01, h360, h2, c01, _c2, v01, l01, _i, _y601, sv01, sl01 ]) => ({
	hex, r01, g01, b01, h360, h2, c01, _c2, v01, l01, _i, _y601, sv01, sl01,
	hsl: toHSL(Math.round(h360 ?? 0), sl01, l01),
	hsv: toHSV(Math.round(h360 ?? 0), sv01, v01),
	rgb: toRGB(r01 * 255, g01 * 255, b01 * 255),
	rgb01: { r: toReal01(r01), g: toReal01(g01), b: toReal01(b01) },
}));


export const testComparator = <C extends object>(
	accessor: (wiki: ItemType<typeof WIKI_COLORS>) => C,
	comparator: (a: C | undefined, b: C | undefined) => number,
	...checks: (string & keyof UnbrandedNumbers<C>)[]
): void => {
	const colors = WIKI_COLORS.map((c) => [ c.hex, accessor(c) ] as [string, C])
		.sort(([ , a ], [ , b ]) => comparator(a, b));
	for (const [ [ aName, a ], [ bName, b ], an, bn ] of window2(colors)) {
		if (an < bn) {
			for (const check of checks) {
				const aValue = a[check] as number;
				const bValue = b[check] as number;
				expect(aValue, `${aName}:${JSON.stringify(a)}.${check} < ${bName}:${JSON.stringify(b)}.${check}`).lte(bValue);
				if (aValue < bValue) {
					break;
				}
			}
		}
	}
	const color = accessor(WIKI_COLORS[0]!);
	expect(comparator(color, color), "===").eq(EQ);
	expect(comparator(color, { ...color }), "copy").eq(EQ);
	expect(comparator(color, undefined), "C < undef").eq(A_LT_B);
	expect(comparator(undefined, color), "undef > C").eq(A_GT_B);
	const busted = { ...color };
	busted[checks[0]!] = undefined as C[string & keyof UnbrandedNumbers<C>];
	expect(comparator(color, busted), "C < partial").eq(A_LT_B);
	expect(comparator(busted, color), "partial > C").eq(A_GT_B);
};
