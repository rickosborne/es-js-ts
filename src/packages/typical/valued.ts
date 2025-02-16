/**
 * Filter out `null` and `undefined` from types.
 * Equivalent to `Exclude<T, null | undefined>`.
 */
export type Valued<T> = T extends null | undefined ? never : T;

/**
 * Equivalent to a recursive `Required`.
 */
export type DeepValued<T> = T extends (infer U)[] ? DeepValued<U>[] :
	T extends object ? { [K in keyof T]: DeepValued<T[K]> } :
		NonNullable<T>;
