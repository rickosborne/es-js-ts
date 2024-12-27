/**
 * Guard to check that the given value is defined and object-like.
 */
export const isObject = (obj: unknown): obj is NonNullable<object> => {
	return obj != null && typeof obj === "object";
};

/**
 * Guard to check that the given value is defined, is an object,
 * and seems to be a "plain" object, descending directly from Object.
 * This won't prevent all shenanigans, but is a low-effort check.
 */
export const isPlainObject = (obj: unknown): obj is Record<never,never> => {
	if (!isObject(obj)) {
		return false;
	}
	const proto = Reflect.getPrototypeOf(obj);
	return proto == null || proto === Object.prototype;
};
