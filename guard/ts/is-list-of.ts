export const isListOf = <T>(
	list: unknown,
	predicate: (item: unknown, index: number, items: unknown[]) => item is T,
): list is T[] => {
	return Array.isArray(list) && list.every(predicate);
};
