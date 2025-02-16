/**
 * Try to spread out the batches evenly.
 * That is, if the list has 11 items with a `maxPerBatch` of 5,
 * instead of getting `[5, 5, 1]` you would get `[4, 4, 3]`.
 */
export const SPREAD_BATCHES = "spread";
/**
 * Fill each batch to the maximum, except possibly the last.
 * That is, if the list has 11 items with a `maxPerBatch` of 5,
 * you would get `[5, 5, 1]`.
 */
export const FILL_BATCHES = "fill";

/**
 * Strategy for grouping array items into batches.
 */
export type ToBatchesMode = typeof SPREAD_BATCHES | typeof FILL_BATCHES;

/**
 * Group the given list into batches of the given maximum count,
 * optionally using a given strategy.
 */
export const toBatches = <T>(maxPerBatch: number, list: T[], mode: ToBatchesMode = FILL_BATCHES): T[][] => {
	if (!Number.isSafeInteger(maxPerBatch) || maxPerBatch < 1) {
		throw new Error("toBatches:maxPerBatch must be a positive integer");
	}
	const itemCount = list.length;
	if (itemCount === 0) {
		return [];
	}
	if (itemCount <= maxPerBatch) {
		return [ list ];
	}
	const batchCount = Math.ceil(itemCount / maxPerBatch);
	const itemsPerBatch = mode === FILL_BATCHES ? maxPerBatch : Math.ceil(itemCount / batchCount);
	const batches: T[][] = [];
	for (let i = 0; i < itemCount; i += itemsPerBatch) {
		batches.push(list.slice(i, i + itemsPerBatch));
	}
	return batches;
};

/**
 * Generate an array reducer which will group the given list into
 * batches of the given maximum count, optionally using a given strategy.
 * @example
 * const batches = list.reduce(...toBatchesReducer(5));
 */
export const toBatchesReducer = <T>(maxPerBatch: number, mode: ToBatchesMode = FILL_BATCHES): [reduce: (prev: T[][], cur: T, index: number, list: T[]) => T[][], initial: T[][]] => {
	if (!Number.isSafeInteger(maxPerBatch) || maxPerBatch < 1) {
		throw new Error("toBatches:maxPerBatch must be a positive integer");
	}
	let itemCount: number | undefined;
	let batchCount: number | undefined;
	let itemsPerBatch: number | undefined;
	return [
		(prev: T[][], cur: T, _index: number, list: T[]): T[][] => {
			itemCount ??= list.length;
			batchCount ??= Math.ceil(itemCount / maxPerBatch);
			itemsPerBatch ??= mode === FILL_BATCHES ? maxPerBatch : Math.ceil(itemCount / batchCount);
			let last = prev.at(-1);
			if (last == null || last.length >= itemsPerBatch) {
				last = [];
				prev.push(last);
			}
			last.push(cur);
			return prev;
		},
		[],
	];
};
