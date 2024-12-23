/**
 * Function which evaluates a value against a condition.
 */
export type UnaryPredicate<T> = (value: T) => boolean;

/**
 * Shorthand for {@link UnaryPredicate}.
 */
export type Predicate<T> = UnaryPredicate<T>;

/**
 * Function which evaluates a value and its position against a condition.
 * Typically used for array or iterator filters.
 */
export type IndexedPredicate<T> = (value: T, index: number) => boolean;
