import type { Candidate } from "./candidate.js";

export interface RankedChoiceCondorcetOptions<B, C extends Candidate> {
	ballots: Iterable<B>;
	/**
	 * @returns candidates in descending preference order.  That is, the most preferred candidate is the first, and the least is the last.
	 */
	rankAccessor: (ballot: B) => C[];
}

export interface RankedChoiceCondorcetOutcome<C extends Candidate> {
	candidate: C;
	losesTo: C[];
	ties: C[];
	winsTo: C[];
}

export interface RankedChoiceCondorcetResult<C extends Candidate> {
	outcome: RankedChoiceCondorcetOutcome<C>[];
}

/**
 * Calculate the Condorcet winner of a ranked-choice election.
 * Due to various spoilers, this may not be the same as the
 * elected winner.
 * @see {@link https://en.wikipedia.org/wiki/Condorcet_method | Condorcet method}
 */
export const rankedChoiceCondorcet = <B, C extends Candidate>({ ballots, rankAccessor }: RankedChoiceCondorcetOptions<B, C>): RankedChoiceCondorcetResult<C> => {
	const outcome: RankedChoiceCondorcetOutcome<C>[] = [];
	const primary = new Map<C, Map<C, number>>();
	const choices: C[][] = [];
	for (const ballot of ballots) {
		const order: C[] = rankAccessor(ballot);
		choices.push(order);
		for (const candidate of order) {
			const existing = primary.get(candidate);
			if (existing == null) {
				primary.set(candidate, new Map<C, number>());
			}
		}
	}
	const candidates = Array.from(primary.keys());
	for (const order of choices) {
		const unseen = new Set<C>(candidates);
		while (order.length > 0) {
			const candidate = order.shift()!;
			unseen.delete(candidate);
			const unmatched = new Set<C>(unseen);
			const prime = primary.get(candidate)!;
			for (const opponent of order) {
				unmatched.delete(opponent);
				prime.set(opponent, 1 + (prime.get(opponent) ?? 0));
			}
			for (const opponent of unmatched) {
				prime.set(opponent, 1 + (prime.get(opponent) ?? 0));
			}
		}
	}
	for (const candidate of candidates) {
		const prime = primary.get(candidate)!;
		const winsTo: C[] = [];
		const losesTo: C[] = [];
		const ties: C[] = [];
		for (const opponent of candidates) {
			if (candidate === opponent) {
				continue;
			}
			const forward = prime.get(opponent) ?? 0;
			const reverse = primary.get(opponent)?.get(candidate) ?? 0;
			if (forward === reverse) {
				ties.push(opponent);
			} else if (forward > reverse) {
				winsTo.push(opponent);
			} else {
				losesTo.push(opponent);
			}
		}
		outcome.push({
			candidate,
			losesTo,
			ties,
			winsTo,
		});
	}
	outcome.sort((a, b) => {
		const ac = a.candidate;
		const bc = b.candidate;
		if (a.winsTo.includes(bc)) {
			return -1;
		}
		if (b.winsTo.includes(ac)) {
			return 1;
		}
		return 0;
	});
	return { outcome };
};
