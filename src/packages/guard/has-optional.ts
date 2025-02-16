import { isObject } from "./is-object.js";

/**
 * Guard for whether the given value is an object with an optional property
 * with the given name.
 * This variant does not check the value, only that the property exists.
 */
export function hasOptional<Name extends string>(obj: unknown, name: Name): obj is { [K in Name]?: unknown };
/**
 * Guard for whether the given value is an object with an optional property
 * with the given name.
 * This variant checks the value against the given predicate.
 */
export function hasOptional<Name extends string, T>(obj: unknown, name: Name, predicate: (value: unknown) => value is T): obj is { [K in Name]?: T };
/**
 * Guard for whether the given value is an object with an optional property
 * with the given name.
 */
export function hasOptional<Name extends string, T>(obj: unknown, name: Name, predicate?: (value: unknown) => value is T): obj is { [K in Name]?: T } {
	if (!isObject(obj)) {
		return false;
	}
	if (!Object.hasOwn(obj, name)) {
		return true;
	}
	return predicate == null || predicate(obj[ name as keyof typeof obj ]);
}
