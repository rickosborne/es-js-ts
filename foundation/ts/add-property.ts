import type { Resolve } from "@rickosborne/typical";

export type ReadOnlyPropertyDescriptor = {
	writable: false;
};

export type PropertyDescriptorFlags = {
	configurable?: boolean;
	enumerable?: boolean;
	writable?: boolean;
};

export type ValuePropertyDescriptor<T> = PropertyDescriptorFlags & {
	value: T;
};

export type GetPropertyDescriptor<T> = PropertyDescriptorFlags & { get(): T; set?: undefined; };
export type SetPropertyDescriptor<T> = PropertyDescriptorFlags & { get?: undefined; set(t: T): void; };
export type GetSetPropertyDescriptor<T> = PropertyDescriptorFlags & { get(): T; set(t: T): void; };

export type TypedPropertyDescriptor<T> = ValuePropertyDescriptor<T> | GetPropertyDescriptor<T> | SetPropertyDescriptor<T> | GetSetPropertyDescriptor<T>;

type IfReadOnly<T, D extends TypedPropertyDescriptor<unknown>> = D extends ReadOnlyPropertyDescriptor | GetPropertyDescriptor<unknown> ? T : never;
type IfReadWrite<T, D extends TypedPropertyDescriptor<unknown>> = D extends ReadOnlyPropertyDescriptor | GetPropertyDescriptor<unknown> ? never : T;
type RenameIfWriteOnly<T extends string, D extends TypedPropertyDescriptor<unknown>> = D extends SetPropertyDescriptor<unknown> ? `${T}IsWriteOnly` : never;
// type IfWriteOnly<T, D extends TypedPropertyDescriptor<unknown>> = D extends SetPropertyDescriptor<unknown> ? T : never;
// Note:
// JS has a concept of a write-only property, and the unit tests cover this.
// However, TS doesn't have a way of expressing it, at least as of v5.8.
// So for now, it goes into the read-write bucket, even though you can't
// actually read from it.
// The alternative would be to set it to `undefined`, to show you can't
// read from it ... but then you lose the type info for the setter.  Yuck.
// For now ...
// The types below will, ahem, mangle the types they produce.  Just a little.
// If you produce a setter-only property, it will end up looking like:
// ```typescript
// const withSetterOnly: WithSetterOnly = addProperty({}, "whatever", { set: (value: string) => void(whatever(value)) });
// type WithSetterOnly = {
//    whatever: string;
//    whateverIsWriteOnly?: undefined;
// }
// ```
// So you get a reminder without breaking anything too hard.


type ReadOnlyKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in K]: IfReadOnly<key, R[key]>;
}[K] : never;

type ReadWriteKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in K]: IfReadWrite<key, R[key]>;
}[K] : never;

type WriteOnlyKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in string & K]: RenameIfWriteOnly<key, R[key]>;
}[string & K] : never;

export type PropertyFromDescriptor<K extends string, D extends TypedPropertyDescriptor<unknown>> = D extends TypedPropertyDescriptor<infer V> ? ({
	readonly [key in IfReadOnly<K, D>]: V;
} & {
	[key in IfReadWrite<K, D>]: V;
} & {
	[key in `${RenameIfWriteOnly<K, D>}`]?: undefined;
}) : never;

export type PropertiesFromDescriptors<R extends Record<string, TypedPropertyDescriptor<unknown>>> = {
	readonly [K in ReadOnlyKeys<R>]: R[K] extends TypedPropertyDescriptor<infer V> ? V : never;
} & {
	[K in ReadWriteKeys<R>]: R[K] extends TypedPropertyDescriptor<infer V> ? V : never;
} & {
	[K in WriteOnlyKeys<R>]?: undefined;
};

/**
 * A more type-friendly version of {@link Object.defineProperty}.
 */
export const addProperty = <T, K extends string, V, D extends TypedPropertyDescriptor<V>>(target: T, key: K, descriptor: D): Resolve<T & PropertyFromDescriptor<K, D>> => {
	return Object.defineProperty(target, key, descriptor) as Resolve<T & PropertyFromDescriptor<K, D>>;
};

/**
 * A more type-friendly version of {@link Object.defineProperties}.
 */
export const addProperties = <T, K extends string, R extends Record<K, TypedPropertyDescriptor<unknown>>>(target: T, descriptors: R): Resolve<T & PropertiesFromDescriptors<R>> => {
	return Object.defineProperties(target, descriptors) as Resolve<T & PropertiesFromDescriptors<R>>;
};
