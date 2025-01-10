/**
 * Filter out `undefined` from types.
 * Equivalent to `Exclude<T, undefined>`.
 */
export type Defined<T> = T extends undefined ? never : T;
