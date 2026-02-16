import type { Candidate } from "./candidate.js";
import { rated, type Unranked } from "./rated.js";

export type ApprovalScore = -1 | 0 | 1;

export interface CombinedApprovalOptions<B, C extends Candidate> {
	approvalAccessor: (ballot: B) => [ candidate: C, score: ApprovalScore ][];
	ballots: B[];
}

export interface CombinedApprovalOutcome<C extends Candidate> {
	candidate: C;
	/**
	 * Count of ballots on which this candidate had a score, including 0 (neutral).
	 */
	count: number;
	negative: number;
	net: number;
	neutral: number;
	positive: number;
	rank: number;
}

export interface CombinedApprovalResult<C extends Candidate> {
	outcome: CombinedApprovalOutcome<C>[];
}

/**
 * Tally the votes of an election in a Combined Approval (CAV) voting system.
 * @see {@link https://en.wikipedia.org/wiki/Combined_approval_voting | Combined approval voting}
 */
export const combinedApproval = <B, C extends Candidate>({ approvalAccessor, ballots }: CombinedApprovalOptions<B, C>): CombinedApprovalResult<C> => {
	return rated<B, C, Unranked<CombinedApprovalOutcome<C>>>({
		addCountAndVotes: (out, votes) => {
			out.count++;
			if (votes === 0) {
				out.neutral++;
			} else if (votes < 0) {
				out.negative++;
				out.net--;
			} else {
				out.positive++;
				out.net++;
			}
		},
		ballots,
		outSupplier: (candidate) => ({ candidate, count: 0, negative: 0, net: 0, neutral: 0, positive: 0 }),
		ratedAccessor: approvalAccessor,
		scoreAccessor: (o) => o.net,
	});
};
