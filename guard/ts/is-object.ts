export const isObject = (obj: unknown): obj is NonNullable<object> => {
	return obj != null && typeof obj === "object";
};

export const isPlainObject = (obj: unknown): obj is Record<never,never> => {
	if (!isObject(obj)) {
		return false;
	}
	const proto = Reflect.getPrototypeOf(obj);
	return proto == null || proto === Object.prototype;
};
