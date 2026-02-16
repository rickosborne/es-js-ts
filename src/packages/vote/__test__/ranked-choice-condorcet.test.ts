import { expect } from "chai";
import { describe, test } from "mocha";
import { rankedChoiceCondorcet, type RankedChoiceCondorcetResult } from "../ranked-choice-condorcet.js";

describe(rankedChoiceCondorcet.name, () => {
	test("center squeeze", () => {
		expect(rankedChoiceCondorcet({
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
				candidate: "M",
				losesTo: [],
				ties: [],
				winsTo: [ "A", "Z" ],
			}, {
				candidate: "A",
				losesTo: [ "M" ],
				ties: [],
				winsTo: [ "Z" ],
			}, {
				candidate: "Z",
				losesTo: [ "A", "M" ],
				ties: [],
				winsTo: [],
			} ],
		} satisfies RankedChoiceCondorcetResult<string>);
	});
});
