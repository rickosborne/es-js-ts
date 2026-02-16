import { describe, test } from "mocha";
import { expect } from "chai";
import { firstPastThePost, type FirstPastThePostResult } from "../first-past-the-post.js";

describe(firstPastThePost.name, () => {
	test("empty", () => {
		expect(firstPastThePost({
			ballots: [],
			candidateAccessor: () => "",
		})).eql({
			ballotCount: 0,
			outcome: [],
		} satisfies FirstPastThePostResult<string>);
	});

	test("basics", () => {
		expect(firstPastThePost({
			ballots: [ "A", "B", "A", "A", "B", "B", "Q", "B" ],
			candidateAccessor: (s) => s,
		})).eql({
			ballotCount: 8,
			outcome: [ {
				candidate: "B",
				votes: 4,
			}, {
				candidate: "A",
				votes: 3,
			}, {
				candidate: "Q",
				votes: 1,
			} ],
		} satisfies FirstPastThePostResult<string>);
	});
	test("ties", () => {
		expect(firstPastThePost({
			ballots: [ "A", "B", "A", "B", "D", "C", "E" ],
			candidateAccessor: (s) => s,
		})).eql({
			ballotCount: 7,
			outcome: [ {
				candidate: "A",
				votes: 2,
			}, {
				candidate: "B",
				votes: 2,
			}, {
				candidate: "C",
				votes: 1,
			}, {
				candidate: "D",
				votes: 1,
			}, {
				candidate: "E",
				votes: 1,
			} ],
		} satisfies FirstPastThePostResult<string>);
	});
});
