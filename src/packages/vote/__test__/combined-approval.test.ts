import { expect } from "chai";
import { describe, test } from "mocha";
import { type ApprovalScore, combinedApproval, type CombinedApprovalResult } from "../combined-approval.js";

describe(combinedApproval.name, () => {
	test("empty", () => {
		expect(combinedApproval({
			ballots: [],
			approvalAccessor: () => [],
		})).eql({
			outcome: [],
		} satisfies CombinedApprovalResult<string>);
	});

	test("tie", () => {
		expect(combinedApproval<[ string, ApprovalScore ][], string>({
			ballots: [
				[ [ "A", 1 ], [ "B", 0 ], [ "C", -1 ] ],
				[ [ "A", -1 ], [ "B", 1 ], [ "C", 1 ] ],
				[ [ "A", 0 ], [ "B", -1 ], [ "C", 0 ] ],
			],
			approvalAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "A",
				count: 3,
				negative: 1,
				net: 0,
				neutral: 1,
				positive: 1,
				rank: 3,
			}, {
				candidate: "B",
				count: 3,
				negative: 1,
				net: 0,
				neutral: 1,
				positive: 1,
				rank: 3,
			}, {
				candidate: "C",
				count: 3,
				negative: 1,
				net: 0,
				neutral: 1,
				positive: 1,
				rank: 3,
			} ],
		} satisfies CombinedApprovalResult<string>);
	});

	test("no tie", () => {
		expect(combinedApproval<[ string, ApprovalScore ][], string>({
			ballots: [
				[ [ "A", 1 ], [ "B", -1 ], [ "C", 1 ] ],
				[ [ "A", -1 ], [ "B", 1 ], [ "C", 1 ] ],
				[ [ "A", 0 ], [ "B", 1 ], [ "C", 0 ] ],
				[ [ "D", -1 ] ],
			],
			approvalAccessor: (b) => b,
		})).eql({
			outcome: [ {
				candidate: "C",
				count: 3,
				negative: 0,
				net: 2,
				neutral: 1,
				positive: 2,
				rank: 1,
			}, {
				candidate: "B",
				count: 3,
				negative: 1,
				net: 1,
				neutral: 0,
				positive: 2,
				rank: 2,
			}, {
				candidate: "A",
				count: 3,
				negative: 1,
				net: 0,
				neutral: 1,
				positive: 1,
				rank: 3,
			}, {
				candidate: "D",
				count: 1,
				negative: 1,
				net: -1,
				neutral: 0,
				positive: 0,
				rank: 4,
			} ],
		} satisfies CombinedApprovalResult<string>);
	});
});
