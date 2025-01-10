import { isPlainObject } from "@rickosborne/guard";
import { jsonPathAppend } from "./json-path-append.js";

export interface DeepCopyOptions {
	/**
	 * Called before an array is copied.  If an array is returned,
	 * copy it instead.  If anything else is returned, substitute
	 * it for the array, without modification.
	 */
	onArray?: (this: void, array: unknown[], jsonPath: string) => unknown;
	/**
	 * Called before a non-copyable value is included.  If a plain
	 * object is returned, copy it instead.  If anything else is
	 * returned, substitute it for the instance without modification.
	 */
	onInstance?: (this: void, instance: object, jsonPath: string) => unknown;
	/**
	 * Modify the keys of an object before they are copied.  Return
	 * null or undefined to use the original, unmodified keys. Provides
	 * an opportunity to modify the insertion order of the keys in the
	 * copy.
	 */
	onKeys?: (this: void, keys: (string | symbol)[], obj: object, jsonPath: string) => ((string | symbol)[] | undefined);
	/**
	 * Called before a plain object is copied.  If a plain object
	 * is returned, copy it instead.  If anything else is returned,
	 * substitute it without modification.
	 */
	onPlainObject?: (this: void, obj: object, jsonPath: string) => unknown;
}

/**
 * Create a deep copy of an object.  This is not a particularly
 * robust check, and won't copy things like class instances.
 */
export const deepCopy = <T>(
	source: T,
	options: DeepCopyOptions = {},
): T => {
	const seen = new Map<object, object>();
	const copy = <U>(value: U, jsonPath: string): U => {
		if (value == null || typeof value !== "object") {
			return value;
		}
		const existing = seen.get(value);
		if (existing != null) {
			return existing as U;
		}
		if (Array.isArray(value)) {
			let values: unknown[] = value;
			if (options.onArray != null) {
				const replacement = options.onArray(value, jsonPath);
				if (Array.isArray(replacement)) {
					values = replacement;
				} else {
					return replacement as U;
				}
			}
			const list: unknown[] = [];
			seen.set(value, list);
			values.forEach((v, n) => {
				list[n] = copy(v, jsonPathAppend(jsonPath, n));
			});
			return list as U;
		}
		let sourceObj = value;
		const record: Record<string | number | symbol, unknown> = {};
		if (!isPlainObject(value)) {
			if (options.onInstance != null) {
				const replacement = options.onInstance(value, jsonPath);
				if (isPlainObject(replacement)) {
					sourceObj = replacement as U & object;
				} else {
					return replacement as U;
				}
			} else {
				seen.set(value, value);
				return value;
			}
		} else if (options.onPlainObject != null) {
			const replacement = options.onPlainObject(value, jsonPath);
			if (isPlainObject(replacement)) {
				sourceObj = replacement as U & object;
			} else {
				return replacement as U;
			}
		}
		seen.set(value, record);
		let keys: (string | symbol)[] = Reflect.ownKeys(sourceObj);
		if (options.onKeys != null) {
			keys = options.onKeys(keys, sourceObj, jsonPath) ?? keys;
		}
		keys.forEach((k) => {
			record[k] = copy(sourceObj[k as keyof U], jsonPathAppend(jsonPath, k));
		});
		return record as U;
	};
	return copy(source, "$");
};
