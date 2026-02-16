import { expect } from "chai";
import { describe, test } from "mocha";
import { rankedChoice, type RankedChoiceResult } from "../ranked-choice.js";

describe(rankedChoice.name, () => {
	test("empty", () => {
		expect(rankedChoice({ ballots: [], rankAccessor: () => [] })).eql({
			outcome: [],
		} satisfies RankedChoiceResult<string>);
	});

	test("2-way tie", () => {
		expect(rankedChoice({
			ballots: [
				[ "A", "B" ],
				[ "A", "B" ],
				[ "B", "A" ],
				[ "B", "A" ],
			],
			rankAccessor: (c) => c,
		})).eql({
			outcome: [ {
				candidate: "A",
				firstWhenEliminated: 2,
				rank: 2,
				total: 4,
			}, {
				candidate: "B",
				firstWhenEliminated: 2,
				rank: 2,
				total: 4,
			} ],
		} satisfies RankedChoiceResult<string>);
	});

	test("3-way tie", () => {
		expect(rankedChoice({
			ballots: [
				[ "A", "B", "C" ],
				[ "C", "A", "B" ],
				[ "B", "C", "A" ],
			],
			rankAccessor: (c) => c,
		})).eql({
			outcome: [ {
				candidate: "A",
				firstWhenEliminated: 1,
				rank: 3,
				total: 3,
			}, {
				candidate: "B",
				firstWhenEliminated: 1,
				rank: 3,
				total: 3,
			}, {
				candidate: "C",
				firstWhenEliminated: 1,
				rank: 3,
				total: 3,
			} ],
		} satisfies RankedChoiceResult<string>);
	});
	/**
	 * @see {@link https://en.wikipedia.org/wiki/Center_squeeze}
	 */
	test("center squeeze", () => {
		expect(rankedChoice({
			ballots: [
				[ "A", "M", "Z" ],
				[ "A", "M", "Z" ],
				[ "A", "M", "Z" ],
				[ "A", "M", "Z" ],
				[ "M", "A", "Z" ],
				[ "M", "A", "Z" ],
				[ "M", "Z", "A" ],
				[ "Z", "M", "A" ],
				[ "Z", "M", "A" ],
				[ "Z", "M", "A" ],
				[ "Z", "M", "A" ],
			],
			rankAccessor: (c) => c,
		})).eql({
			outcome: [ {
				candidate: "A",
				firstWhenEliminated: 11,
				rank: 1,
				total: 11,
			}, {
				candidate: "Z",
				firstWhenEliminated: 5,
				rank: 2,
				total: 11,
			}, {
				candidate: "M",
				firstWhenEliminated: 3,
				rank: 3,
				total: 11,
			} ],
		} satisfies RankedChoiceResult<string>);
	});
});
