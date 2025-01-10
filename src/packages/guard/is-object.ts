/**
 * A symbol which can be exposed when you want {@link isPlainObject} to
 * be false for an object.  It doesn't matter what the value is.
 */
export const notPlainObject = Symbol("notPlainObject");

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
	if (Reflect.getOwnPropertyDescriptor(obj, notPlainObject) != null || Reflect.get(obj, notPlainObject) != null) {
		return false;
	}
	const proto = Reflect.getPrototypeOf(obj);
	return proto == null || proto === Object.prototype;
};
