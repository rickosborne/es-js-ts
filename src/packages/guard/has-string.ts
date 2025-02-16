import { hasOwn } from "./has-own.js";
import { isString } from "./is-string.js";

/**
 * Check whether the given value is an object, has a property with the
 * given name, and the value of that property is a string.
 */
export const hasString = <Name extends string>(obj: unknown, name: Name): obj is { [k in Name]: string } => {
	return hasOwn(obj, name) && isString(obj[ name ]);
};
