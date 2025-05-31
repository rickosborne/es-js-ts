import { expect } from "chai";
import { describe, test } from "mocha";
import { qrsHashCode } from "../qrs-hash-code.js";

describe(qrsHashCode.name, () => {
	test("collisions", () => {
		const span = 256;
		const results = new Map<bigint, [q: number, r: number]>();
		const collisions: [hash: bigint, q1: number, r1: number, q2: number, r2: number][] = [];
		for (let q = -span; q <= span; q++) {
			for (let r = -span; r <= span; r++) {
				const hash = qrsHashCode({ q, r });
				if (results.has(hash)) {
					const [ cq, cr ] = results.get(hash)!;
					console.error(`Collision: <${q},${r}> vs <${cq},${cr}> via ${hash.toString(16)}`);
					collisions.push([ hash, q, r, cq, cr ]);
				} else {
					results.set(hash, [ q, r ]);
				}
			}
		}
		expect(collisions).eql([]);
	});
});
