/**
 * Type guard for a Promise-like "thenable".
 */
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> => {
	return value != null && !Array.isArray(value) && typeof value === "object" && "then" in value && typeof value.then === "function";
};
