/**
 * A wrapper for `Object.entries` which has typed keys and values.
 */
export const entriesOf = Object.entries as <T extends object>(obj: T) => [keyof T, T[keyof T]][];
