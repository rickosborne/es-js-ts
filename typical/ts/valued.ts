/**
 * Filter out `null` and `undefined` from types.
 * Equivalent to `Exclude<T, null | undefined>`.
 */
export type Valued<T> = T extends null | undefined ? never : T;
