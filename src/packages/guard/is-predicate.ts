import type { UnaryPredicate } from "@rickosborne/typical";

/**
 * Tests whether the given object is a function and takes at
 * least one parameter, and could maybe act as a unary predicate.
 * Warning!  Since no type information is available at runtime,
 * it may not actually act as a predicate!
 */
export const isUnaryPredicate = (obj: unknown): obj is UnaryPredicate<unknown> => {
	return typeof obj === "function" && obj.length >= 1;
};
