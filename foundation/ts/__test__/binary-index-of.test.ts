import { expect } from "chai";
import { describe, it } from "mocha";
import { type BinaryIndexOfConfig, type SearchResult, binaryIndexOf } from "../binary-index-of.js";
import type { Comparator } from "@rickosborne/typical";

const numericAsc: Comparator<number> = (a, b) => a - b;
const numbers = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

function testNumeric(value: number, comparisons: number, index: number, before?: undefined, config?: BinaryIndexOfConfig): void;
function testNumeric(value: number, comparisons: number, index: undefined, before: number, config?: BinaryIndexOfConfig): void;
function testNumeric(value: number, comparisons: number, index: number | undefined, before?: number | undefined, config?: BinaryIndexOfConfig): void {
	const searchResult = index != null ? {
		comparisons,
		exists: true,
		index,
	} : {
		before,
		comparisons,
		exists: false,
	};
	expect(binaryIndexOf(value, numbers, numericAsc, config)).eql(searchResult);
}

describe(binaryIndexOf.name, () => {
	it("does nothing with an empty array", () => {
		expect(binaryIndexOf(1, [], numericAsc)).eql({ before: 0, comparisons: 0, exists: false } satisfies SearchResult);
	});
	it("can find the head", () => {
		testNumeric(0, 4, 0);
		testNumeric(0, 1, 0, undefined, { rangeCheck: true });
	});
	it("can find the tail", () => {
		testNumeric(9, 3, 9);
		testNumeric(9, 2, 9, undefined, { rangeCheck: true });
	});
	it("can find near the tail", () => {
		testNumeric(8, 2, 8);
		testNumeric(8, 5, 8, undefined, { rangeCheck: true });
	});
	it("can find near the head", () => {
		testNumeric(1, 3, 1);
		testNumeric(1, 6, 1, undefined, { rangeCheck: true });
	});
	it("can point to the end", () => {
		testNumeric(10, 3, undefined, 10);
		testNumeric(10, 2, undefined, 10, { rangeCheck: true });
	});
	it("can point to the beginning", () => {
		testNumeric(-1, 4, undefined, 0);
		testNumeric(-1, 1, undefined, 0, { rangeCheck: true });
	});
	it("can find toward the left", () => {
		testNumeric(4, 3, 4);
		testNumeric(4, 5, 4, undefined, { rangeCheck: true });
	});
	it("can find toward the right", () => {
		testNumeric(7, 3, 7);
		testNumeric(7, 4, 7, undefined, { rangeCheck: true });
	});
	it("can find the first duplicate", () => {
		const tripThrees: number[] = [ 0, 1, 2, 3, 3, 3, 4, 5, 6 ];
		expect(binaryIndexOf(3, tripThrees, numericAsc)).eql({ comparisons: 1, exists: true, index: 4 } satisfies SearchResult);
		expect(binaryIndexOf(3, tripThrees, numericAsc, { firstNonUnique: true })).eql({ comparisons: 3, exists: true, index: 3 } satisfies SearchResult);
	});
	it("can find the first at the end", () => {
		const tripThrees: number[] = [ 0, 1, 1, 2, 2, 3, 3, 3 ];
		expect(binaryIndexOf(3, tripThrees, numericAsc)).eql({ comparisons: 2, exists: true, index: 6 } satisfies SearchResult);
		expect(binaryIndexOf(3, tripThrees, numericAsc, { firstNonUnique: true })).eql({ comparisons: 4, exists: true, index: 5 } satisfies SearchResult);
		expect(binaryIndexOf(3, tripThrees, numericAsc, { rangeCheck: true })).eql({ comparisons: 2, exists: true, index: 7 } satisfies SearchResult);
		expect(binaryIndexOf(3, tripThrees, numericAsc, { firstNonUnique: true, rangeCheck: true })).eql({ comparisons: 5, exists: true, index: 5 } satisfies SearchResult);
	});
	it("can find the first at the beginning", () => {
		const trips: number[] = [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ];
		expect(binaryIndexOf(0, trips, numericAsc)).eql({ comparisons: 2, exists: true, index: 2 } satisfies SearchResult);
		expect(binaryIndexOf(0, trips, numericAsc, { firstNonUnique: true })).eql({ comparisons: 4, exists: true, index: 0 } satisfies SearchResult);
		expect(binaryIndexOf(0, trips, numericAsc, { rangeCheck: true })).eql({ comparisons: 1, exists: true, index: 0 } satisfies SearchResult);
		expect(binaryIndexOf(0, trips, numericAsc, { firstNonUnique: true, rangeCheck: true })).eql({ comparisons: 1, exists: true, index: 0 } satisfies SearchResult);
	});
});
