type R<T> = T;

/**
 * Try to coerce tsc into showing an integrated type,
 * instead of a type intersection / union / etc.
 */
export type Resolve<T> = R<{ [k in keyof T]: T[k] }>;
