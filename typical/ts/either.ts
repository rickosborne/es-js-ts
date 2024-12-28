/**
 * Combine two types such that matching keys are overwritten entirely
 * by the Winner.
 */
export type Overwrite<Loser, Winner> = Omit<Loser, keyof Winner> & Winner;

/**
 * Map a type such that it has the same keys, but they all have <kbd>never</kbd>
 * as their value type.  Generally combined with {@link Overwrite}.
 * Used when you want to acknowledge the possible presence of those
 * properties, but you want to mask them out so they're never read
 * or written in any meaningful way.
 */
export type NeverEvery<T> = {
	readonly [K in keyof T]?: never;
};

/**
 * Produce a union of intersections, where all keys are present for
 * both types, and can be used in destructuring assignments, but
 * the individual property values are still mutually exclusive.
 * @example
 * ```typescript
 * type StringNode = { text: string; type: "string"; };
 * type DateNode   = { date: Date; type: "number"; }
 * ```
 * If you tried to do a simple union:
 * ```typescript
 * type BrokenNode = StringNode | DateNode;
 * ```
 * You would not be able to do a single destructuring assignment:
 * ```typescript
 * // tsc will complain about the dat and text here
 * const { date, text, type } = node;
 * ```
 * Instead, you could do this:
 * ```typescript
 * type Node = Either<StringNode, DateNode>;
 * ```
 * This produces the same effective signature as:
 * ```typescript
 * type Node2 = {
 *     date?: never;
 *     text: string;
 *     type: "string";
 * } | {
 *     date: Date;
 *     text?: never;
 *     type: "date";
 * }
 * ```
 * That type then allows:
 * ```typescript
 * const { date, text, type } = node;
 * ```
 * Modern versions of TypeScript are also smart enough to let this work:
 * ```typescript
 * const labelForNode = ({ date, text, type }: Node): string => {
 *     if (type === "date") {
 *         return date.toISOString();
 *     } else {
 *         return text;
 *     }
 * };
 * ```
 */
export type Either<T, U> = Overwrite<NeverEvery<T>, U> | Overwrite<NeverEvery<U>, T>;
