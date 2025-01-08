/**
 * Remove the "wildcard" parts of an object, leaving only the concrete,
 * specified parts.  That is, it removes any keys which could be any
 * string, any number, or any symbol.
 */
export type NoRecord<T extends object> = object extends T ? Record<never, unknown> : {
	[K in keyof T as string extends K ? never : symbol extends K ? never : number extends K ? never : K]: T[K];
};
