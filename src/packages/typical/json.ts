/**
 * A scalar literal value which can be serialized as JSON.
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * An array which contains only values which can be serialized as JSON.
 */
export type JSONArray = JSONSerializable[];

/**
 * A record which contains only keys and values which can be serialized
 * as JSON.
 */
export interface JSONObject extends Record<string, JSONSerializable> {}

/**
 * Any value which can be serialized as JSON.
 */
export type JSONSerializable = JSONPrimitive | JSONObject | JSONArray;

export type JSONSerializableOf<T> = T extends JSONPrimitive ? T
	: T extends (infer U)[] ? JSONSerializableOf<U>[]
		: T extends undefined ? never
			: T extends object ? { [K in keyof T]: JSONSerializableOf<T[K]> }
			: never;
