import { isObject } from "./is-object.js";

/**
 * Guard for whether the given value is an object with a property
 * with the given name.
 * This variant does not check the value, only that the property exists.
 */
export function hasOwn<Name extends string | symbol>(obj: unknown, name: Name): obj is { [K in Name]: unknown };
/**
 * Guard for whether the given value is an object with a property
 * with the given name.
 * This variant checks the value against the given predicate.
 */
export function hasOwn<Name extends string | symbol, T>(obj: unknown, name: Name, predicate: (value: unknown) => value is T): obj is { [K in Name]: T };
/**
 * Guard for whether the given value is an object with a property
 * with the given name.
 */
export function hasOwn<Name extends string | symbol, T>(obj: unknown, name: Name, predicate?: (value: unknown) => value is T): obj is { [K in Name]: T } {
	if (!isObject(obj) || !Object.hasOwn(obj, name)) {
		return false;
	}
	return predicate == null || predicate(obj[ name as keyof typeof obj ]);
}
