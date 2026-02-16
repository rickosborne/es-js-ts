import type { Candidate } from "./candidate.js";
import { type Ranked, rated, type RatedOutcome } from "./rated.js";

export interface StarOptions<B, C extends Candidate> {
	ballots: B[];
	starAccessor: (ballot: B) => [ candidate: C, votes: number ][];
}

interface StarVersus {
	losses: number;
	ties: number;
	wins: number;
}

/**
 * This is only used internal to the `star` function, to track 1v1
 * results before they are flattened.
 */
interface StarRatedOutcome<C extends Candidate> extends RatedOutcome<C> {
	versus: Map<C, StarVersus>;
}

export interface StarRunoffOutcome<C extends Candidate> extends RatedOutcome<C> {
	losesTo: C[];
	ties: C[];
	winsTo: C[];
}

export interface StarResult<C extends Candidate> {
	outcome: StarRunoffOutcome<C>[];
}

/**
 * Helper for managing maps of {@link StarVersus} structures, because
 * JS Map structures don't have `getOrCompute`.
 */
const getOrCreateVersus = <C extends Candidate>(out: StarRatedOutcome<C>, opponent: C): StarVersus => {
	const existing = out.versus.get(opponent);
	if (existing != null) {
		return existing;
	}
	const versus: StarVersus = { losses: 0, ties: 0, wins: 0 };
	out.versus.set(opponent, versus);
	return versus;
};

/**
 * Even though candidates may have been tied (same-ranked) coming out of Phase 1,
 * their 1v1 results may have broken those ties in Phase 2.  Recalculate the ranks
 * of the Phase 2 participants by comparing wins and losses.
 */
const reRankWinners = <C extends Candidate>(winners: StarRunoffOutcome<C>[]): void => {
	const candidateIndex = new Map<C, StarRunoffOutcome<C>>(winners.map((out) => [ out.candidate, out ]));
	let reRank = true;
	do {
		// We may need to make several passes for large cycles.
		let anyChanges = false;
		for (let i = winners.length - 1; i >= 0; i--) {
			// Rank is the maximum of everyone you lost to or tied.
			const out = winners[i]!;
			let max = Math.min(Math.max(i + 1, out.rank), winners.length);
			for (const opponent of out.losesTo.concat(out.ties)) {
				const opponentRank = candidateIndex.get(opponent)?.rank;
				if (opponentRank != null) {
					max = Math.max(opponentRank, max);
				}
			}
			if (out.rank !== max) {
				anyChanges = true;
				out.rank = max;
			}
		}
		if (!anyChanges) {
			reRank = false;
		}
	} while (reRank);
};

const findAllCandidates = <B, C extends Candidate>(ballots: B[], starAccessor: StarOptions<B, C>["starAccessor"]): Set<C> => {
	const candidates = new Set<C>();
	if (candidates.size === 0) {
		for (const ballot of ballots) {
			const scores = starAccessor(ballot);
			for (const [ candidate ] of scores) {
				candidates.add(candidate);
			}
		}
	}
	return candidates;
};

/**
 * Run a rated election against all ballots and candidates.
 * This is a superset of a normal rated election, as STAR needs to find a Condorcet winner.
 * It does this by explicitly counting each unlisted candidate on a ballot as a loss
 * against all the listed candidates on that ballot.
 * Here, that means we need to track all the 1v1 stats as we go through each ballot.
 */
const scoreAllCandidates = <B, C extends Candidate>(ballots: B[], starAccessor: StarOptions<B, C>["starAccessor"], candidates: Set<C>): Ranked<StarRatedOutcome<C>>[] => {
	return rated<B, C, StarRatedOutcome<C>>({
		addCountAndVotes: (out, votes, scores) => {
			out.count++;
			out.votes += votes;
			// Candidates which are not present on this ballot.
			const unseen = new Set<C>(candidates);
			unseen.delete(out.candidate);
			// For every score on this ballot, track win/loss/tie against the other candidates.
			for (const [ opponent, opponentVotes ] of scores) {
				if (opponent === out.candidate) {
					continue;
				}
				unseen.delete(opponent);
				const versus = getOrCreateVersus(out, opponent);
				if (opponentVotes === votes) {
					versus.ties++;
				} else if (opponentVotes > votes) {
					versus.losses++;
				} else {
					versus.wins++;
				}
			}
			// Add wins against opponents not listed on this ballot
			for (const opponent of unseen) {
				getOrCreateVersus(out, opponent).wins++;
			}
		},
		// For each ballot, add losses for any candidate not scored
		afterBallot: (scores, byCandidate) => {
			// Candidates not listed on this ballot
			const unseen = new Set<C>(candidates);
			// Candidates explicitly listed on this ballot
			const seen = new Set<C>();
			// Move each listed candidate from unseen to seen
			for (const [ candidate ] of scores) {
				unseen.delete(candidate);
				seen.add(candidate);
			}
			// Each unlisted candidate scores losses against each listed candidate
			for (const candidate of unseen) {
				let out: StarRatedOutcome<C> | undefined = byCandidate.get(candidate);
				if (out == null) {
					out = { candidate, count: 0, versus: new Map(), votes: 0, rank: -1 };
					byCandidate.set(candidate, out);
				}
				for (const opponent of seen) {
					getOrCreateVersus(out, opponent).losses++;
				}
			}
		},
		ballots,
		ratedAccessor: starAccessor,
		// The first phase sorts by aggregate score, which is tracked here as `votes`
		scoreAccessor: (out) => out.votes,
		outSupplier: (candidate) => ({ candidate, count: 0, rank: -1, versus: new Map(), votes: 0 }),
	}).outcome;
};

/**
 * Flatten the scored Map structures into winsTo/losesTo/ties, as the specific counts are not important.
 */
const prepareForRunOff = <C extends Candidate>(scored: Ranked<StarRatedOutcome<C>>[]): StarRunoffOutcome<C>[] => {
	return scored.map((out) => {
		const { versus, ...noVersus } = out;
		const runoff: StarRunoffOutcome<C> = { ...noVersus, losesTo: [], ties: [], winsTo: [] };
		for (const [ opponent, { losses, wins } ] of versus.entries()) {
			if (wins > losses) {
				runoff.winsTo.push(opponent);
			} else if (losses > wins) {
				runoff.losesTo.push(opponent);
			} else {
				runoff.ties.push(opponent);
			}
		}
		// Sort each list of candidates for more deterministic results
		runoff.losesTo.sort();
		runoff.ties.sort();
		runoff.winsTo.sort();
		return runoff;
	});
};

/**
 * Find at least 2 top candidates which can proceed to the instant run-off of Phase 2.
 * In the case of ties, there may be more than 2.
 */
const findRunOffCandidates = <C extends Candidate>(candidates: Set<C>, runoffs: StarRunoffOutcome<C>[]): StarRunoffOutcome<C>[] => {
	let top: StarRunoffOutcome<C>[] = [];
	let rank = 1;
	while (top.length < 2 && rank < candidates.size) {
		top = runoffs.filter((out) => out.rank <= rank);
		rank++;
	}
	return top;
};

/**
 * Sort the 1v1 outcomes according to their 1v1 stats (wins/losses/ties).
 * Technically, a sort operation here should be equivalent to a topological sort.
 * However, this minimalist implementation may break for really nasty cycle corner cases.
 * But we assume here it's relatively safe for scenarios where the number of
 * ballots greatly exceeds the number of candidates.
 */
const sortByWinsLosses = <C extends Candidate>(outcomes: StarRunoffOutcome<C>[]): void => {
	outcomes.sort((a, b) => {
		const candidate = a.candidate;
		const opponent = b.candidate;
		// These should be symmetric.
		if (a.winsTo.includes(opponent) && b.losesTo.includes(candidate)) {
			return -1;
		} else if (a.losesTo.includes(opponent) && b.winsTo.includes(candidate)) {
			return 1;
		}
		return 0;
	});
};

/**
 * Tally the votes of an election in the STAR voting system.
 * Votes score each candidate on a scale where `0` is the least preferred,
 * and some larger number (usually `5`) is the most preferred.
 * From there:
 *
 * 1. Candidates are sorted by their aggregate score, descending.
 * 2. All but the top 2 candidates are eliminated.
 * 3. An instant run-off chooses the winner based on which is the
 *    preferred candidate (higher of the 2 scores) on more ballots.
 * @see {@link https://en.wikipedia.org/wiki/STAR_voting | STAR voting}
 */
export const star = <B, C extends Candidate>({ ballots, starAccessor }: StarOptions<B, C>): StarResult<C> => {
	// Phase 0: We need a list of all candidates so we can score zeros (losses)
	// when a candidate is not listed on a ballot.
	// We could accept a list of candidates as an option, but this full scan
	// will also catch "write-in" candidates which are on few ballots.
	const candidates = findAllCandidates(ballots, starAccessor);
	// Phase 1: Aggregate all scores for all candidates, and track how each
	// candidate fares against the others.
	const scored = scoreAllCandidates(ballots, starAccessor, candidates);
	// Flatten the Map structures into winsTo/losesTo/ties.
	const runoffs = prepareForRunOff(scored);
	// Try to find the top 2 candidates by rank, which was calculated above by aggregate votes.
	const top = findRunOffCandidates(candidates, runoffs);
	// Sort the candidates according to their 1v1 stats.
	sortByWinsLosses(top);
	// We may have ties, so we may need to re-rank.
	reRankWinners(top);
	// The candidates not in the winners block are not re-ranked, and can be copied as-is.
	const topCandidates = new Set<C>(top.map((out) => out.candidate));
	const bottom: StarRunoffOutcome<C>[] = runoffs.filter((out) => !topCandidates.has(out.candidate));
	return { outcome: top.concat(bottom) };
};
