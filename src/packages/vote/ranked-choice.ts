import type { Candidate } from "./candidate.js";
import { tallyComparator } from "./tally-comparator.js";

export interface RankedChoiceOptions<B, C extends Candidate> {
	ballots: Iterable<B>;
	/**
	 * @returns candidates in descending preference order.  That is, the most preferred candidate is the first, and the least is the last.
	 */
	rankAccessor: (ballot: B) => C[];
}

export interface RankedChoiceTally<C extends Candidate> {
	candidate: C;
	firstWhenEliminated: number;
	/**
	 * Ascending from 1, where 1 is the preferred candidate.
	 * May have ties!
	 */
	rank: number;
	total: number;
}

export interface RankedChoiceResult<C extends Candidate> {
	outcome: RankedChoiceTally<C>[];
}

/**
 * Tally the votes in a ranked-choice / instant-runoff election.
 * Returns the candidates in order of decreasing preference.
 * That is, the most favored candidate is first and the least is last.
 * This algorithm is slightly better than the naive implementation
 * when B is much greater than C, running in O(B * N + B * C).
 */
export const rankedChoice = <B, C extends Candidate>({ ballots, rankAccessor }: RankedChoiceOptions<B, C>): RankedChoiceResult<C> => {
	// The ballots, converted to their vote stats.
	const votes: C[][] = [];
	// The count of ballots where each candidate is the top choice.
	const firsts = new Map<C, number>();
	// The count of ballots on which the candidate is listed at all.
	const totals = new Map<C, number>();
	// Phase 1: build out a preference count for each candidate
	for (const ballot of ballots) {
		const ordered: C[] = rankAccessor(ballot);
		votes.push(ordered);
		const first = ordered[0];
		if (first == null) {
			continue;
		}
		firsts.set(first, 1 + (firsts.get(first) ?? 0));
		for (const candidate of ordered) {
			totals.set(candidate, 1 + (totals.get(candidate) ?? 0));
		}
	}
	// Phase 2: Round by round, eliminate the lowest-preferred
	// candidate(s) until at most 1 remains.
	let rank = totals.size;
	const outcome: RankedChoiceTally<C>[] = [];
	while (firsts.size > 1) {
		// Sort the candidates by descending top-preference count.
		const ordered = Array.from(firsts.entries())
			.sort(tallyComparator);
		// Find the preference count for the least-favored candidate.
		const firstWhenEliminated = ordered[ordered.length - 1]?.[1];
		if (firstWhenEliminated == null) {
			break;
		}
		// Find all candidates which match this least-favored count.
		const eliminated: C[] = ordered
			.filter(([ _, count ]) => count === firstWhenEliminated)
			.map(([ candidate, _ ]) => candidate)
			.reverse();
		// Remove each eliminated candidate from each ballot.
		for (const candidate of eliminated) {
			const total = totals.get(candidate) ?? 0;
			outcome.unshift({ candidate, firstWhenEliminated, rank, total });
			for (const remaining of votes) {
				const index = remaining.indexOf(candidate);
				// Not all candidates will be listed on all ballots.
				if (index >= 0) {
					remaining.splice(index, 1);
					// If the eliminated candidate was the first ...
					if (index === 0) {
						const second = remaining[0];
						// ... and if there's a new top candidate ...
						if (second != null) {
							// ... then update the top-preference count for that new candidate.
							firsts.set(second, 1 + (firsts.get(second) ?? 0));
						}
					}
				}
			}
			firsts.delete(candidate);
		}
		rank -= eliminated.length;
	}
	// We should have at most 1 winner left.
	const winners = Array.from(firsts.entries())
		.sort(tallyComparator)
		.reverse();
	// Add the winners to our outcomes.
	for (const [ candidate, firstWhenEliminated ] of winners) {
		const total = totals.get(candidate) ?? 0;
		outcome.unshift({ candidate, firstWhenEliminated, rank, total });
	}
	return { outcome };
};

