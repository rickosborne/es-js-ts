import type { Candidate } from "./candidate.js";
import { fixRanks } from "./fix-ranks.js";
import { tallyComparator } from "./tally-comparator.js";

export type Ranked<T extends object> = T & {
	candidate: Candidate;
	rank: number;
}
export type Unranked<R extends { rank: number }> = Omit<R, "rank">;

export type CandidateVotes<C> = [candidate: C, votes: number];

export interface RatedOptions<B, C extends Candidate, O extends object> {
	/**
	 * Modify the `O` outcome object for a candidate with the given votes.
	 */
	addCountAndVotes: (out: O, votes: number, scores: CandidateVotes<C>[]) => void;
	/**
	 * Additional (optional) processing for each ballot after its score has been counted.
	 */
	afterBallot?: (votes: CandidateVotes<C>[], byCandidate: Map<C, Ranked<O>>) => void;
	/**
	 * Additional (optional) processing for rach candidate outcome after all ballots have been scored.
	 */
	afterTally?: (out: O) => void;
	ballots: B[];
	outSupplier: (candidate: C) => O,
	/**
	 * Extract the vote scores from a ballot.
	 */
	ratedAccessor: (ballot: B) => CandidateVotes<C>[];
	/**
	 * When sorting candidate outcomes, use the number provided by this accessor.
	 */
	scoreAccessor: (out: O) => number;
}

export interface RatedOutcome<C extends Candidate> {
	candidate: C;
	/**
	 * How many ballots included a positive score for this candidate.
	 */
	count: number;
	/**
	 * Overall rank in the range `[1...count]`, where lower is better.
	 */
	rank: number;
	/**
	 * Aggregate votes for this candidate.  This may or may not
	 * be the same as the score.
	 */
	votes: number;
}

export interface RatedResult<O extends object> {
	outcome: Ranked<O>[];
}

/**
 * Generalized algorithm for tallying votes in rated voting systems.
 */
export const rated = <B, C extends Candidate, O extends object>({ addCountAndVotes, afterBallot, afterTally, ballots, outSupplier, ratedAccessor, scoreAccessor }: RatedOptions<B, C, O>): RatedResult<O> => {
	const byCandidate = new Map<C, Ranked<O>>();
	for (const ballot of ballots) {
		const scores = ratedAccessor(ballot);
		for (const [ candidate, votes ] of scores) {
			let out: Ranked<O> | undefined = byCandidate.get(candidate);
			if (out == null) {
				const unranked: O = outSupplier(candidate);
				out = { ...unranked, candidate, rank: -1 };
				byCandidate.set(candidate, out);
			}
			addCountAndVotes(out, votes, scores);
		}
		afterBallot?.(scores, byCandidate);
	}
	if (afterTally != null) {
		for (const out of byCandidate.values()) {
			afterTally(out);
		}
	}
	const outcome: Ranked<O>[] = Array.from(byCandidate.values())
		.sort((a, b) => tallyComparator([ a.candidate, scoreAccessor(a) ], [ b.candidate, scoreAccessor(b) ]));
	return { outcome: fixRanks(outcome, scoreAccessor) };
};
