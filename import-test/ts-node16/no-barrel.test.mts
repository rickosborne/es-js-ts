import { arrayEq } from "@rickosborne/foundation/array-eq";
import { memoize } from "@rickosborne/foundation/memoize";
import { isUnaryPredicate } from "@rickosborne/guard/is-predicate";
import { describe, it } from "node:test";

describe("no-barrel", () => {
	let callCount = 0;
	const once = memoize(() => ++callCount);
	it("memoizes", () => {
		const oneThree = [ once(), once(), once() ];
		if (!arrayEq(oneThree, [ 1, 1, 1 ])) {
			throw new Error("Should have been 1 * 3");
		}
	})
	it("keeps functions intact", () => {
		if (isUnaryPredicate(once)) {
			throw new Error("Not a unary predicate!");
		}
		if (!isUnaryPredicate((a: string, b: number) => a === String(b))) {
			throw new Error("Should have been a unary predicate");
		}
	});
});



