export type ShuffleConfig<T> = {
	/**
	 * Target array.  Defaults to the given array, shuffling in place.
	 */
	into?: T[] | undefined;
	/**
	 * Generate a random float in the range {@code [0..1)}.
	 */
	random01?: () => number;
}

/**
 * Fisher-Yates shuffle.
 * Defaults to in-place sorting, but can sort into a new one via {@code into}.
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
export const shuffle = <T>(
	list: T[],
	{ into = list, random01 = Math.random }: ShuffleConfig<T> = {},
): T[] => {
	const n = list.length;
	for (let i = 0; i < n; i++) {
		const j = Math.trunc(random01() * (i + 1));
		const t = list[ i ];
		into[ i ] = into[ j ];
		into[ j ] = t;
	}
	return into;
};

export const toShuffled = <T>(list: T[], config?: Omit<ShuffleConfig<T>, "into"> | undefined): T[] => shuffle(list, { ...config, into: Array<T>(list.length) });
