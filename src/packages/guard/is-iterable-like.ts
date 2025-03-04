export const isIterableLike = <T = unknown>(value: unknown): value is Iterable<T> => {
	if (value == null) {
		return false;
	}
	if (typeof value === "string" || Array.isArray(value)) {
		return true;
	}
	if (typeof value !== "object") {
		return false;
	}
	try {
		const it = value[ Symbol.iterator as keyof typeof value ];
		if (typeof it === "function") {
			return true;
		}
	} catch (_e: unknown) {
		// do nothing
	}
	return false;
};

export const isAsyncIterableLike = <T = unknown>(value: unknown): value is AsyncIterable<T> => {
	if (value == null) {
		return false;
	}
	try {
		const it = value[ Symbol.asyncIterator as keyof typeof value ];
		if (typeof it === "function") {
			return true;
		}
	} catch (_e: unknown) {
		// do nothing
	}
	return false;
};

