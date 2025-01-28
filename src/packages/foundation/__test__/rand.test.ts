import { expect } from "chai";
import { describe, it, test } from "mocha";
import type { RNG } from "../rand.js";
import { LCE_PRESET_NAMES, randomNumberGenerator } from "../rand.js";

const testDistribution = (
	rng: RNG,
	float: boolean = false,
) => {
	const start = 0;
	const end = 100;
	const freedom = end - start;
	const range = freedom + 1;
	const count = range * 5000;
	const expected = count / range;
	const counts = new Map<number, number>();
	const rand: () => number = float ? (() => Math.trunc(rng.float01() * (end + 1))) : (() => rng.range(0, end + 1));
	for (let i = 0; i < count; i++) {
		const r = rand();
		counts.set(r, (counts.get(r) ?? 0) + 1);
	}
	expect(counts.get(start - 1), String(start - 1)).is.undefined;
	expect(counts.get(end + 1), String(end + 1)).is.undefined;
	let sse = 0;
	for (let i = start; i <= end; i++) {
		const n = counts.get(i);
		expect(n, String(i)).is.not.undefined;
		expect(n, String(i)).gt(0);
		const diff = n! - expected;
		sse += diff * diff;
	}
	const mse = sse / range;
	const me = Math.sqrt(mse);
	const mep = me / expected;
	// console.log(`[${rng.name}] n=${count} exp=${expected} df=${freedom} mse=${mse.toFixed(3)} me=${me.toFixed(3)} mep=${mep.toFixed(3)}`);
	// console.log(Object.fromEntries(counts));
	expect(mep, "mep").lte(0.025);
};

describe("rand", () => {
	describe("java", () => {
		it("generates the same sequence given the same seed", () => {
			const javaRNG = randomNumberGenerator(12345, "java");
			const actual = Array.from(javaRNG.ints(10));
			expect(actual).eql([ 0x5c9f20d6, 0x8361b331, 0xeed8a922, 0xeac80778, 0xd545798e, 0x9a4ef89, 0x5393ea7f, 0x1fea4064, 0x3c4b499b, 0x90bc6fa ]);
		});
		it("generates the same sequence given the same seed", () => {
			const javaRNG = randomNumberGenerator(12345, "java");
			const actual = Array.from(javaRNG.ranges(0, 100, 10));
			expect(actual).eql([ 51, 80, 41, 28, 55, 84, 75, 2, 1, 89 ]);
		});
		test("clone", () => {
			const javaRNG = randomNumberGenerator(12345, "java");
			const first = javaRNG.int();
			expect(first).eq(0x5c9f20d6);
			const copy = javaRNG.clone();
			expect(Array.from(copy.ints(5))).eql(Array.from(javaRNG.ints(5)));
		});
	});
	for (const presetName of LCE_PRESET_NAMES) {
		test(presetName.concat(" range"), () => {
			const rand = randomNumberGenerator(undefined, presetName);
			testDistribution(rand, false);
		});
		test(presetName.concat(" float"), () => {
			const rand = randomNumberGenerator(undefined, presetName);
			testDistribution(rand, true);
		});
	}
});
