import { expect } from "chai";
import { describe, it } from "mocha";
import { randomBounded } from "../random-bounded.js";
import type { RandomBounded } from "../random-bounded.js";

const testDistribution = (
	fn: RandomBounded<number>,
	iterations?: number | undefined,
) => {
	const start = fn.isLowerInc ? fn.lower : (fn.lower + 1);
	const end = fn.isUpperInc ? fn.upper : (fn.upper - 1);
	const freedom = end - start;
	const range = freedom + 1;
	const count = iterations ?? (range * 5000);
	const expected = count / range;
	const counts = new Map<number, number>();
	for (let n = 0; n < count; n++) {
		const r = fn();
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
	// console.log(`n=${count} exp=${expected} df=${freedom} mse=${mse.toFixed(3)} me=${me.toFixed(3)} mep=${mep.toFixed(3)}`);
	// console.log(Object.fromEntries(counts));
	expect(mep, "mep").lte(0.025);
};

describe(randomBounded.name, () => {
	it("provides a uniform distribution", () => {
		const randomGrade = randomBounded("Grade", "Grade", true, 0, true, 100, true);
		testDistribution(randomGrade);
		const randomStars = randomBounded("Grade", "Grade", false, 0, true, 5, true);
		testDistribution(randomStars);
	});
});
