import { hasOwn } from "./has-own.js";
import { isObject, isPlainObject } from "./is-object.js";

/**
 * Guard for whether an object has a property with the given name
 * and an object value.
 */
export const hasObject = <Name extends string>(obj: unknown, name: Name): obj is { [k in Name]: object } => {
	return hasOwn(obj, name) && isObject(obj[ name ]);
};

/**
 * Guard for whether an object has a property with the given name
 * and a plain object value.
 */
export const hasPlainObject = <Name extends string>(obj: unknown, name: Name): obj is { [k in Name]: Record<never, never> } => {
	return hasOwn(obj, name) && isPlainObject(obj[ name ]);
};
