import type { SpecificKeys } from "./keys.js";

/**
 * Map a type such that it has the same keys, but they all have `never`
 * as their value type.  Generally combined with `Overwrite`.
 * Used when you want to acknowledge the possible presence of those
 * properties, but you want to mask them out so they're never read
 * or written in any meaningful way.
 */
export type NeverEvery<T extends object> = {
	[K in keyof T as K extends SpecificKeys<T> ? K : never]?: never;
};
