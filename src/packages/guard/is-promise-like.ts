/**
 * Type guard for a Promise-like "thenable".
 */
export const isPromiseLike = <T = unknown>(value: unknown): value is PromiseLike<T> => {
	return value != null && !Array.isArray(value) && typeof value === "object" && "then" in value && typeof value.then === "function";
};
