import { hasOwn } from "./has-own.js";

/**
 * Guard for whether an object has a property with the given name
 * and a numeric value.
 */
export const hasNumber = <Name extends string>(obj: unknown, name: Name): obj is { [k in Name]: number } => {
	return hasOwn(obj, name) && typeof obj[ name ] === "number";
};
