import type { NeverEvery } from "./never-every.js";
import type { Overwrite } from "./overwrite.js";

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
export type Either<T extends object, U extends object> = Overwrite<NeverEvery<T>, U> | Overwrite<NeverEvery<U>, T>;
