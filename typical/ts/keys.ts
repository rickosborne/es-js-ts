import type { IfEquals } from "./equal.js";

/**
 * Extract only the keys for properties which cannot have undefined or null values.
 */
export type RequiredKeys<T extends object> = keyof {
	[K in keyof T as undefined extends T[K] ? never : K extends SpecificKeys<T> ? K : never]: K;
};

/**
 * Extract only the keys for properties which could have undefined or null values.
 */
export type OptionalKeys<T extends object> = keyof {
	[K in keyof T as undefined extends T[K] ? K extends SpecificKeys<T> ? K : never : null extends T[K] ? K extends SpecificKeys<T> ? K : never : never]: K;
};

/**
 * Extract only the keys for properties which could have Boolean values.
 */
export type FlagKeys<T extends object> = keyof {
	[K in keyof T as boolean extends T[K] ? K extends SpecificKeys<T> ? K : never : never]: K;
};

/**
 * Extract only the keys for properties which are read-only.
 */
export type ReadOnlyKeys<T extends object> = keyof {
	[K in keyof T as IfEquals<{ readonly [key in K]: T[K] }, { [key in K]: T[K] }, K extends SpecificKeys<T> ? K : never>]: K;
};

/**
 * All keys from both types, combined.
 */
export type CombinedKeys<T extends object, U extends object> = SpecificKeys<T> | SpecificKeys<U>;

/**
 * Only the keys which exist in both types.
 */
export type SharedKeys<T extends object, U extends object> = SpecificKeys<T> & SpecificKeys<U>;

/**
 * Eliminate catch-all keys from a union.
 */
export type SpecificKey<K extends string | number | symbol> = K extends string ? string extends K ? never : K : K extends symbol ? symbol extends K ? never : K : K extends number ? number extends K ? never : K : never;

/**
 * Eliminate catch-all keys from an object.
 */
export type SpecificKeys<T extends object> = T extends object ? object extends T ? never : SpecificKey<keyof T> : never;

/**
 * If the object has any specific keys, return it.
 */
export type IfSpecificKeys<T extends object> = SpecificKeys<T> extends never ? never : T;

