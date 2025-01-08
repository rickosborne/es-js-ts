/**
 * Filter out `null` from types.
 * Equivalent to `Exclude<T, null>`.
 */
export type NonNull<T> = T extends null ? never : T;
