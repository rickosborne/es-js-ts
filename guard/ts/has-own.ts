import { isObject } from "./is-object.js";

export function hasOwn<Name extends string>(obj: unknown, name: Name): obj is {[K in Name]: unknown};
export function hasOwn<Name extends string, T>(obj: unknown, name: Name, predicate: (value: unknown) => value is T): obj is {[K in Name]: T};
export function hasOwn<Name extends string, T>(obj: unknown, name: Name, predicate?: (value: unknown) => value is T): obj is {[K in Name]: T} {
	if (!isObject(obj) || !Object.hasOwn(obj, name)) {
		return false;
	}
	return predicate == null || predicate(obj[name as keyof typeof obj]);
}
