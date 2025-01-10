import { describe, it } from "mocha";
import { expect } from "chai";
import { arrayBinaryMinHeap } from "../binary-heap.js";
import { numberAsc } from "../comparator.js";
import { intRange } from "../int-range.js";
import { toShuffled } from "../shuffle.js";

describe(arrayBinaryMinHeap.name, () => {
	it("sorts itself when asked", () => {
		const ordered = intRange.from(2).up.toInclusive(9).toArray();
		const shuffled = toShuffled(ordered).concat(1);
		ordered.unshift(1);
		const heap = arrayBinaryMinHeap<number>(numberAsc);
		heap.addAll(shuffled);
		expect(heap.toArray()).eql(ordered);
		heap.sort();
		expect(heap.toArray()).eql(ordered);
		expect(heap.unsorted).eql(ordered);
	});
});
