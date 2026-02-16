import type { Candidate } from "./candidate.js";
import { fixRanks } from "./fix-ranks.js";
import { tallyComparator } from "./tally-comparator.js";

export interface ApprovalOptions<B, C extends Candidate> {
	ballots: Iterable<B>;
	/**
	 * @returns A list of approved candidates.  Non-approved candidates are not returned.
	 */
	approvalAccessor: (ballot: B) => C[];
}

export interface ApprovalResultOutcome<C extends Candidate> {
	candidate: C;
	rank: number;
	total: number;
}

export interface ApprovalResult<C extends Candidate> {
	outcome: ApprovalResultOutcome<C>[];
}

/**
 * Tally the votes in an Approval election.
 * Tries to return the outcome by descending vote count and then
 * ascending candidate.  There may be ties!
 * @see {@link https://en.wikipedia.org/wiki/Approval_voting | Approval voting}
 */
export const approval = <B, C extends Candidate>({ approvalAccessor, ballots }: ApprovalOptions<B, C>): ApprovalResult<C> => {
	const totals = new Map<C, number>();
	for (const ballot of ballots) {
		const approved = approvalAccessor(ballot);
		for (const candidate of approved) {
			totals.set(candidate, 1 + (totals.get(candidate) ?? 0));
		}
	}
	const outcome = Array.from(totals.entries())
		.sort(tallyComparator)
		.map(([ candidate, total ]) => ({ candidate, rank: 0, total }));
	return { outcome: fixRanks(outcome, (o) => o.total) };
};
