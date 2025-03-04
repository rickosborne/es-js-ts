export const isIteratorLike = <T = unknown>(value: unknown): value is Iterator<T, unknown, unknown> | AsyncIterator<T, unknown, unknown> => {
	if (value == null) {
		return false;
	}
	if (typeof value !== "object") {
		return false;
	}
	const next = (value as Record<string, unknown>)["next"];
	return next != null && typeof next === "function";
};
