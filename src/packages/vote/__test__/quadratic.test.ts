import { expect } from "chai";
import { describe, test } from "mocha";
import { quadratic, type QuadraticResult } from "../quadratic.js";

describe(quadratic.name, () => {
	test("empty", () => {
		expect(quadratic({
			ballots: [],
			quadraticAccessor: () => [],
		})).eql({
			outcome: [],
		} satisfies QuadraticResult<string>);
	});
	test("tie", () => {
		expect(quadratic<[ string, number ][], string>({
			ballots: [
				[ [ "A", 4 ] ],
				[ [ "B", 1 ], [ "C", 1 ], [ "D", 1 ], [ "E", 1 ] ],
				[ [ "B", 1 ], [ "C", 1 ], [ "D", 1 ], [ "E", 1 ] ],
			],
			quadraticAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "A",
				count: 1,
				rank: 5,
				score: 2,
				votes: 4,
			}, {
				candidate: "B",
				count: 2,
				rank: 5,
				score: 2,
				votes: 2,
			}, {
				candidate: "C",
				count: 2,
				rank: 5,
				score: 2,
				votes: 2,
			}, {
				candidate: "D",
				count: 2,
				rank: 5,
				score: 2,
				votes: 2,
			}, {
				candidate: "E",
				count: 2,
				rank: 5,
				score: 2,
				votes: 2,
			} ],
		} satisfies QuadraticResult<string>);
	});

	test("no ties", () => {
		expect(quadratic<[ string, number ][], string>({
			ballots: [
				[ [ "A", 9 ], [ "D", 1 ] ],
				[ [ "A", 4 ], [ "B", 4 ], [ "C", 1 ], [ "D", 1 ] ],
				[ [ "A", 1 ], [ "B", 4 ], [ "C", 4 ], [ "D", 1 ] ],
				[ [ "B", 9 ], [ "C", 1 ] ],
			],
			quadraticAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "B",
				count: 3,
				rank: 1,
				score: 7,
				votes: 17,
			}, {
				candidate: "A",
				count: 3,
				rank: 2,
				score: 6,
				votes: 14,
			}, {
				candidate: "C",
				count: 3,
				rank: 3,
				score: 4,
				votes: 6,
			}, {
				candidate: "D",
				count: 3,
				rank: 4,
				score: 3,
				votes: 3,
			} ],
		} satisfies QuadraticResult<string>);
	});
});
