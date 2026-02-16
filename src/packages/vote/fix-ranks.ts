/**
 * Helper which rewrites `rank` values in-place based on the
 * existing order and a number returned from an accessor.
 * Ranks will then be in the range `[1...count]` but may have
 * holes and duplicates to account for ties.
 */
export const fixRanks = <T extends { rank: number }>(items: T[], accessor: (outcome: T, index: number) => number): T[] => {
	let last = Number.NaN;
	let rank = items.length + 1;
	let delta = 1;
	for (let i = items.length - 1; i >= 0; i--) {
		const item = items[i]!;
		const value = accessor(item, i);
		if (value === last) {
			delta++;
		} else {
			rank -= delta;
			delta = 1;
		}
		item.rank = rank;
		last = value;
	}
	return items;
};
