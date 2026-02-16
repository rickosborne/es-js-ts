import { expect } from "chai";
import { describe, test } from "mocha";
import { star, type StarResult } from "../star.js";

describe(star.name, () => {
	test("empty", () => {
		expect(star({
			ballots: [],
			starAccessor: () => [],
		})).eql({
			outcome: [],
		} satisfies StarResult<string>);
	});

	test("tie", () => {
		expect(star<[ string, number ][], string>({
			ballots: [
				[ [ "A", 4 ], [ "B", 3 ], [ "C", 2 ] ],
				[ [ "A", 3 ], [ "B", 2 ], [ "C", 4 ] ],
				[ [ "A", 2 ], [ "B", 4 ], [ "C", 3 ] ],
			],
			starAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "A",
				count: 3,
				losesTo: [ "C" ],
				rank: 3,
				ties: [],
				votes: 9,
				winsTo: [ "B" ],
			}, {
				candidate: "B",
				count: 3,
				losesTo: [ "A" ],
				rank: 3,
				ties: [],
				votes: 9,
				winsTo: [ "C" ],
			}, {
				candidate: "C",
				count: 3,
				losesTo: [ "B" ],
				rank: 3,
				ties: [],
				votes: 9,
				winsTo: [ "A" ],
			} ],
		} satisfies StarResult<string>);
	});

	test("tie for second/last", () => {
		expect(star<[ string, number ][], string>({
			ballots: [
				[ [ "A", 4 ], [ "B", 3 ], [ "C", 2 ], [ "E", 5 ] ],
				[ [ "A", 3 ], [ "B", 2 ], [ "C", 4 ], [ "E", 5 ] ],
				[ [ "A", 2 ], [ "B", 4 ], [ "C", 3 ], [ "F", 5 ] ],
			],
			starAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "E",
				count: 2,
				losesTo: [ ],
				rank: 1,
				ties: [],
				votes: 10,
				winsTo: [ "A", "B", "C", "F" ],
			}, {
				candidate: "A",
				count: 3,
				losesTo: [ "C", "E" ],
				rank: 4,
				ties: [],
				votes: 9,
				winsTo: [ "B", "F" ],
			}, {
				candidate: "B",
				count: 3,
				losesTo: [ "A", "E" ],
				rank: 4,
				ties: [],
				votes: 9,
				winsTo: [ "C", "F" ],
			}, {
				candidate: "C",
				count: 3,
				losesTo: [ "B", "E" ],
				rank: 4,
				ties: [],
				votes: 9,
				winsTo: [ "A", "F" ],
			}, {
				candidate: "F",
				count: 1,
				losesTo: [ "A", "B", "C", "E" ],
				rank: 5,
				ties: [],
				votes: 5,
				winsTo: [ ],
			} ],
		} satisfies StarResult<string>);
	});

	test("no ties", () => {
		expect(star<[ string, number ][], string>({
			ballots: [
				[ [ "A", 5 ], [ "D", 1 ] ],
				[ [ "A", 4 ], [ "B", 4 ], [ "C", 1 ], [ "D", 1 ] ],
				[ [ "A", 1 ], [ "B", 4 ], [ "C", 4 ], [ "D", 1 ] ],
				[ [ "B", 5 ], [ "C", 1 ] ],
			],
			starAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "B",
				count: 3,
				losesTo: [],
				rank: 1,
				ties: [],
				votes: 13,
				winsTo: [ "A", "C", "D" ],
			}, {
				candidate: "A",
				count: 3,
				losesTo: [ "B" ],
				rank: 2,
				ties: [ "C" ],
				votes: 10,
				winsTo: [ "D" ],
			}, {
				candidate: "C",
				count: 3,
				losesTo: [ "B" ],
				rank: 3,
				ties: [ "A" ],
				votes: 6,
				winsTo: [ "D" ],
			}, {
				candidate: "D",
				count: 3,
				losesTo: [ "A", "B", "C" ],
				rank: 4,
				ties: [],
				votes: 3,
				winsTo: [],
			} ],
		} satisfies StarResult<string>);
	});
});
