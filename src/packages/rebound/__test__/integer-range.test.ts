import { expect } from "chai";
import { describe, it } from "mocha";
import { int255 } from "../int255.js";
import { IntegerRange } from "../integer-range.js";
import { real01 } from "../real01.js";

describe(IntegerRange.name, () => {
	const one256 = 1 / 256;
	const examples: [ value: number, expected: number ][] = [
		[ 1, 255 ], [ 0, 0 ], [ 0.5, 128 ],
		[ 0.49999999, 127 ], [ 255 * one256, 255 ],
		[ 255 * one256 - 0.00000001, 254 ], [ one256, 1 ],
		[ one256 - 0.00000001, 0 ],
	];
	for (const [ from01, expected ] of examples) {
		it(`converts ${ from01 } to ${ expected }`, () => {
			expect(int255.range.scaleValueFrom(from01, real01.range)).eq(expected);
		});
	}
	it("distributes evenly when scaling from real", () => {
		const expected = 15;
		const count = 256 * expected;
		const delta = 1 / count;
		const counted: number[] = [];
		for (let i = 0; i < count; i++) {
			const result = int255.range.scaleValueFrom(delta * i, real01.range);
			counted[result] ??= 0;
			counted[result]++;
		}
		for (const i of int255.integers) {
			expect(counted[i], String(i)).eq(expected);
		}
		expect(int255.range.scaleValueFrom(1, real01.range)).eq(255);
	});
	it("scales evenly", () => {
		const small = new IntegerRange(3, 6);
		const med = new IntegerRange(5, 12);
		const large = new IntegerRange(7, 18);
		const sm: [s: number, m: number][] = [
			[ 3, 5 ], [ 4, 7 ], [ 5, 10 ], [ 6, 12 ],
		];
		for (const [ s, m ] of sm) {
			expect(med.scaleValueFrom(s, small), `S${s} to M${m}`).eq(m);
			expect(small.scaleValueFrom(m, med), `M${m} to S${s}`).eq(s);
		}
		const sl: [s: number, l: number][] = [
			[ 3, 7 ], [ 4, 11 ], [ 5, 15 ], [ 6, 18 ],
		];
		for (const [ s, l ] of sl) {
			expect(large.scaleValueFrom(s, small), `S${s} to L${l}`).eq(l);
			expect(small.scaleValueFrom(l, large), `L${l} to S${s}`).eq(s);
		}
		const ml: [s: number, l: number][] = [
			[ 5, 7 ], [ 6, 8 ], [ 7, 10 ], [ 8, 12 ],
			[ 9, 13 ], [ 10, 15 ], [ 11, 17 ], [ 12, 18 ],
		];
		for (const [ m, l ] of ml) {
			expect(large.scaleValueFrom(m, med), `M${m} to L${l}`).eq(l);
		}
	});
});
