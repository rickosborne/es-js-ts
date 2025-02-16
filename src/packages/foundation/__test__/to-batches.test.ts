import { expect } from "chai";
import { describe, it, test } from "mocha";
import { FILL_BATCHES, SPREAD_BATCHES, toBatches, toBatchesReducer } from "../to-batches.js";

describe("to-batches", () => {
	const testBatches = <T>(maxPerBatch: number, list: T[], fillBatches: T[][], spreadBatches: T[][] = fillBatches): void => {
		expect(toBatches(maxPerBatch, list, FILL_BATCHES), "toBatches fill").eql(fillBatches);
		expect(list.reduce(...toBatchesReducer(maxPerBatch, FILL_BATCHES)), "toBatchesReducer fill").eql(fillBatches);
		expect(toBatches(maxPerBatch, list, SPREAD_BATCHES), "toBatches spread").eql(spreadBatches);
		expect(list.reduce(...toBatchesReducer(maxPerBatch, SPREAD_BATCHES)), "toBatchesReducer spread").eql(spreadBatches);
	};
	test("empty", () => testBatches(5, [], []));
	test("one", () => testBatches(5, [ 1, 2, 3, 4 ], [ [ 1, 2, 3, 4 ] ]));
	test("two", () => testBatches(3, [ 1, 2, 3, 4 ], [ [ 1, 2, 3 ], [ 4 ] ], [ [ 1, 2 ], [ 3, 4 ] ]));
	test("max", () => testBatches(1, [ 1, 2, 3, 4 ], [ [ 1 ], [ 2 ], [ 3 ], [ 4 ] ]));
	it("throws for zero", () => {
		expect(() => testBatches(0, [], [])).throws(Error, "toBatches:maxPerBatch must be a positive integer");
	});
	it("throws for fraction", () => {
		expect(() => testBatches(1.5, [], [])).throws(Error, "toBatches:maxPerBatch must be a positive integer");
	});
});
