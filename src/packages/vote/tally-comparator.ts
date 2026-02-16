import type { Candidate } from "./candidate.js";

/**
 * Sort a list of candidates and vote counts descending by vote count
 * and then ascending by candidate.
 */
export const tallyComparator = ([ ac, av ]: [ Candidate, number ], [ bc, bv ]: [ Candidate, number ]): number => {
	const d = bv - av;
	if (d != 0) {
		return d;
	}
	if (typeof ac === "string" && typeof bc === "string") {
		return ac.localeCompare(bc);
	} else if (typeof ac === "number" && typeof bc === "number") {
		return ac - bc;
	}
	return 0;
};
