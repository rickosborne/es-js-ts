/**
 * Find the type of the items in an array.
 */
export type ItemType<T extends unknown[]> = T extends (infer U)[] ? U : never;
