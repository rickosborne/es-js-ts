import { hasOwn } from "./has-own.js";

export const hasNumber = <Name extends string>(obj: unknown, name: Name): obj is {[k in Name]: string} => {
	return hasOwn(obj, name) && typeof obj[name] === "number";
};
