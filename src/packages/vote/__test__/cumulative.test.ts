import { expect } from "chai";
import { describe, test } from "mocha";
import { cumulative, type CumulativeResult } from "../cumulative.js";

describe(cumulative.name, () => {
	test("empty", () => {
		expect(cumulative({
			ballots: [],
			cumulativeAccessor: () => [],
		})).eql({
			outcome: [],
		} satisfies CumulativeResult<string>);
	});
	test("tie", () => {
		expect(cumulative<[ string, number ][], string>({
			ballots: [
				[ [ "A", 4 ] ],
				[ [ "B", 1 ], [ "C", 1 ], [ "D", 1 ], [ "E", 1 ] ],
				[ [ "B", 1 ], [ "C", 1 ], [ "D", 1 ], [ "E", 1 ] ],
				[ [ "B", 2 ], [ "C", 2 ] ],
				[ [ "D", 2 ], [ "E", 2 ] ],
			],
			cumulativeAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "A",
				count: 1,
				rank: 5,
				votes: 4,
			}, {
				candidate: "B",
				count: 3,
				rank: 5,
				votes: 4,
			}, {
				candidate: "C",
				count: 3,
				rank: 5,
				votes: 4,
			}, {
				candidate: "D",
				count: 3,
				rank: 5,
				votes: 4,
			}, {
				candidate: "E",
				count: 3,
				rank: 5,
				votes: 4,
			} ],
		} satisfies CumulativeResult<string>);
	});

	test("no ties", () => {
		expect(cumulative<[ string, number ][], string>({
			ballots: [
				[ [ "A", 9 ], [ "D", 1 ] ],
				[ [ "A", 4 ], [ "B", 4 ], [ "C", 1 ], [ "D", 1 ] ],
				[ [ "A", 1 ], [ "B", 4 ], [ "C", 4 ], [ "D", 1 ] ],
				[ [ "B", 9 ], [ "C", 1 ] ],
			],
			cumulativeAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "B",
				count: 3,
				rank: 1,
				votes: 17,
			}, {
				candidate: "A",
				count: 3,
				rank: 2,
				votes: 14,
			}, {
				candidate: "C",
				count: 3,
				rank: 3,
				votes: 6,
			}, {
				candidate: "D",
				count: 3,
				rank: 4,
				votes: 3,
			} ],
		} satisfies CumulativeResult<string>);
	});
});
