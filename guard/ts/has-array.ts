import { hasOwn } from "./has-own.js";
import { isListOf } from "./is-list-of.js";

export function hasArray<Name extends string>(obj: unknown, name: Name, predicate?: undefined): obj is { [K in Name]: unknown[] };
export function hasArray<Name extends string, Item>(obj: unknown, name: Name, predicate?: (item: unknown, index: number, items: unknown[]) => item is Item): obj is { [K in Name]: Item[] };
export function hasArray<Name extends string, Item>(obj: unknown, name: Name, predicate?: (item: unknown, index: number, items: unknown[]) => item is Item): obj is { [K in Name]: Item[] } {
	return hasOwn(obj, name) && (predicate == null || isListOf(obj[name], predicate));
}
