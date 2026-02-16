import type { Candidate } from "./candidate.js";
import { rated, type RatedOutcome } from "./rated.js";

export interface QuadraticOptions<B, C extends Candidate> {
	ballots: B[];
	quadraticAccessor: (ballot: B) => [ candidate: C, votes: number ][];
	/**
	 * Optional conversion function from votes to score.
	 * @defaultValue Math.sqrt
	 */
	scoreFromVotes?: (votes: number) => number;
}

export interface QuadraticOutcome<C extends Candidate> extends RatedOutcome<C> {
	/**
	 * Aggregate votes/score after the cost (square root)
	 * function has been applied.
	 */
	score: number;
}

export interface QuadraticResult<C extends Candidate> {
	outcome: QuadraticOutcome<C>[];
}

/**
 * Tally the votes in a quadratic voting system.
 * That is, a system which allocates a voting budget for each ballot,
 * and a function to convert a number of votes down to a score.
 * For this system, "votes" means the budgeted cost, while "score"
 * means the resulting tallied number accounted to the candidate.
 * Typically, this conversion is square root: 2 votes costs 4 budget,
 * 3 votes costs 9, etc.
 * @see {@link https://en.wikipedia.org/wiki/Quadratic_voting | Quadratic voting}
 */
export const quadratic = <B, C extends Candidate>({ ballots, quadraticAccessor, scoreFromVotes = Math.sqrt }: QuadraticOptions<B, C>): QuadraticResult<C> => {
	return rated<B, C, Omit<QuadraticOutcome<C>, "rank">>({
		addCountAndVotes: (o, votes) => {
			o.count++;
			o.votes += votes;
			o.score += scoreFromVotes(votes);
		},
		ballots,
		outSupplier: (candidate) => ({ candidate, count: 0, score: 0, votes: 0 }),
		ratedAccessor: quadraticAccessor,
		scoreAccessor: (o) => o.score,
	});
};
