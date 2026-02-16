import type { Candidate } from "./candidate.js";
import { rated, type RatedOutcome, type Unranked } from "./rated.js";

export interface CumulativeOptions<B, C extends Candidate> {
	ballots: B[];
	cumulativeAccessor: (ballot: B) => [ candidate: C, votes: number ][];
}

export interface CumulativeOutcome<C extends Candidate> extends RatedOutcome<C> {
}

export interface CumulativeResult<C extends Candidate> {
	outcome: CumulativeOutcome<C>[];
}

/**
 * Tally the votes in a Cumulative voting system.
 * That is, a system which allows the voter to select multiple candidates
 * or lump their votes onto one or more candidates.
 */
export const cumulative = <B, C extends Candidate>({ ballots, cumulativeAccessor }: CumulativeOptions<B, C>): CumulativeResult<C> => {
	return rated<B, C, Unranked<CumulativeOutcome<C>>>({
		addCountAndVotes: (out, votes) => {
			out.count++;
			out.votes += votes;
		},
		ballots,
		outSupplier: (candidate) => ({ candidate, count: 0, votes: 0 }),
		ratedAccessor: cumulativeAccessor,
		scoreAccessor: (o) => o.votes,
	});
};
