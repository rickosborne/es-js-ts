import type { Candidate } from "./candidate.js";
import { tallyComparator } from "./tally-comparator.js";

export interface FirstPastThePostOptions<B, C extends Candidate> {
	ballots: Iterable<B>;
	candidateAccessor: (ballot: B) => C;
}

export interface FirstPastThePostTally<C extends Candidate> {
	candidate: C;
	votes: number;
}

export interface FirstPastThePostResult<C extends Candidate> {
	ballotCount: number;
	outcome: FirstPastThePostTally<C>[];
}

/**
 * Tally the votes in a first-past-the-post (plurality) election.
 * Tries to return the outcome by descending vote count and then
 * ascending candidate.  There may be ties!
 * @see {@link https://en.wikipedia.org/wiki/First-past-the-post_voting | First-past-the-post voting}
 */
export const firstPastThePost = <B, C extends Candidate>({ ballots, candidateAccessor }: FirstPastThePostOptions<B, C>): FirstPastThePostResult<C> => {
	const votesByCandidate = new Map<C, number>();
	let ballotCount = 0;
	for (const ballot of ballots) {
		const candidate = candidateAccessor(ballot);
		const before = votesByCandidate.get(candidate) ?? 0;
		votesByCandidate.set(candidate, before + 1);
		ballotCount++;
	}
	const outcome: FirstPastThePostTally<C>[] = Array.from(votesByCandidate.entries())
		.sort(tallyComparator)
		.map(([ candidate, votes ]) => ({ candidate, votes }));
	return { ballotCount, outcome };
};
