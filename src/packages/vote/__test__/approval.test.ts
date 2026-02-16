import { expect } from "chai";
import { describe, test } from "mocha";
import { approval, type ApprovalResult } from "../approval.js";

describe(approval.name, () => {
	test("empty", () => {
		expect(approval({
			ballots: [],
			approvalAccessor: () => [],
		})).eql({
			outcome: [],
		} satisfies ApprovalResult<string>);
	});

	test("tie", () => {
		expect(approval({
			ballots: [
				[ "A", "B" ],
				[ "A", "C" ],
				[ "B", "C" ],
			],
			approvalAccessor: (a) => a,
		})).eql({
			outcome: [ {
				candidate: "A",
				rank: 3,
				total: 2,
			}, {
				candidate: "B",
				rank: 3,
				total: 2,
			}, {
				candidate: "C",
				rank: 3,
				total: 2,
			} ],
		} satisfies ApprovalResult<string>);
	});

	test("no ties", () => {
		expect(approval({
			ballots: [
				[ "A", "B", "C" ],
				[ "A", "C" ],
				[ "B", "C" ],
				[ "B" ],
				[ "C" ],
			],
			approvalAccessor: (a) => a,
		})).eql({
			outcome: [ {
				candidate: "C",
				rank: 1,
				total: 4,
			}, {
				candidate: "B",
				rank: 2,
				total: 3,
			}, {
				candidate: "A",
				rank: 3,
				total: 2,
			} ],
		} satisfies ApprovalResult<string>);
	});
});
