import { expect } from "chai";
import { describe, test } from "mocha";
import { roid } from "../roid.js";

describe.skip("roid speed test", function (){
	this.timeout(10_000);
	test("3 seconds", async () => {
		const startTime = Date.now();
		const finishBefore = startTime + 8_000;
		let actualFinish = 0;
		const set = new Set<string>();
		let total = 0;
		const count = await new Promise<number>((resolve) => {
			const batch = () => {
				for (let i = 0; i < 256; i++) {
					const id = roid();
					if (set.has(id)) {
						throw new Error(`Duplicate: ${id}`);
					}
					set.add(id);
					total++;
				}
				const now = Date.now();
				if (now < finishBefore) {
					setTimeout(batch);
				} else {
					actualFinish = now;
					resolve(total);
				}
			};
			batch();
		});
		expect(count).gt(0);
		const perMs = count / (actualFinish - startTime);
		console.log(`per ms: ${Math.floor(perMs)}`);
		// 2026-01-07: 124/ms in batches of 256 on a 2020 mac Air
	});
});
