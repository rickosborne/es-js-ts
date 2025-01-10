import { hasOwn } from "./has-own.js";
import { isListOf } from "./is-list-of.js";

/**
 * Guard for whether the given value is an object which has a property with its own array value.
 * This variant does not exhaustively check the items of the array.
 */
export function hasArray<Name extends string>(obj: unknown, name: Name, predicate?: undefined): obj is { [K in Name]: unknown[] };
/**
 * Guard for whether the given value is an object which has a property with its own array value.
 * This variant exhaustively checks the items of the array against the given predicate.
 */
export function hasArray<Name extends string, Item>(obj: unknown, name: Name, predicate?: (item: unknown, index: number, items: unknown[]) => item is Item): obj is { [K in Name]: Item[] };
/**
 * Guard for whether the given value is an object which has a property with its own array value.
 */
export function hasArray<Name extends string, Item>(obj: unknown, name: Name, predicate?: (item: unknown, index: number, items: unknown[]) => item is Item): obj is { [K in Name]: Item[] } {
	return hasOwn(obj, name) && Array.isArray(obj[name]) && (predicate == null || isListOf(obj[name], predicate));
}
