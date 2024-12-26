import type { Resolve } from "@rickosborne/typical";

/**
 * Partial property descriptor which has been
 * marked as non-writable.
 */
export type ReadOnlyPropertyDescriptor = {
	writable: false;
};

/**
 * Basic flags for any property descriptor.
 */
export type PropertyDescriptorFlags = {
	configurable?: boolean;
	enumerable?: boolean;
	writable?: boolean;
};

/**
 * Partial property descriptor which contains a static value,
 * instead of an accessor and/or mutator.
 */
export type ValuePropertyDescriptor<T> = PropertyDescriptorFlags & {
	value: T;
};

/**
 * Partial property descriptor which includes only an accessor (getter)
 * and not a mutator, and is thus read-only.
 */
export type GetPropertyDescriptor<T> = PropertyDescriptorFlags & { get(): T; set?: undefined; };

/**
 * Partial property descriptor which includes only a mutator (setter)
 * and not an accessor (getter), and is thus write-only.
 * Note: TypeScript support for these kinds of properties is very
 * poor as of v5.7.
 */
export type SetPropertyDescriptor<T> = PropertyDescriptorFlags & { get?: undefined; set(t: T): void; };

/**
 * Partial property descriptor which includes both an accessor (getter)
 * and mutator (setter), and is thus read-write.
 */
export type GetSetPropertyDescriptor<T> = PropertyDescriptorFlags & { get(): T; set(t: T): void; };

/**
 * Union for reasonable configurations of property descriptors which
 * could affect the type for the property.
 */
export type TypedPropertyDescriptor<T> = ValuePropertyDescriptor<T> | GetPropertyDescriptor<T> | SetPropertyDescriptor<T> | GetSetPropertyDescriptor<T>;

/**
 * Filter type <kbd>T</kbd> based on whether the property descriptor
 * <kbd>D</kbd> would produce a read-only property.
 */
export type IfReadOnlyDescriptor<T, D extends TypedPropertyDescriptor<unknown>> = D extends ReadOnlyPropertyDescriptor | GetPropertyDescriptor<unknown> ? T : never;

/**
 * Filter type <kbd>T</kbd> based on whether the property descriptor
 * <kbd>D</kbd> would produce a read-write (or write-only) property.
 */
export type IfReadWriteDescriptor<T, D extends TypedPropertyDescriptor<unknown>> = D extends ReadOnlyPropertyDescriptor | GetPropertyDescriptor<unknown> ? never : T;

/**
 * Mangle the given <kbd>Key</kbd> to <kbd>${Key}IsWriteOnly</kbd> if
 * property descriptor <kbd>D</kbd> would produce a write-only property.
 */
export type RenameIfWriteOnlyDescriptor<Key extends string, D extends TypedPropertyDescriptor<unknown>> = D extends SetPropertyDescriptor<unknown> ? `${Key}IsWriteOnly` : never;

/**
 * Filter type <kbd>T</kbd> based on whether the property descriptor
 * <kbd>D</kbd> would produce a write-only property.
 * Note:
 * JS has a concept of a write-only property, and the unit tests cover this.
 * However, TS doesn't have a way of expressing it, at least as of v5.8.
 * So for now, it goes into the read-write bucket, even though you can't
 * actually read from it.
 * The alternative would be to set it to `undefined`, to show you can't
 * read from it ... but then you lose the type info for the setter.  Yuck.
 * For now ...
 * The types below will, ahem, mangle the types they produce.  Just a little.
 * If you produce a setter-only property, it will end up looking like:
 * ```typescript
 * const withSetterOnly: WithSetterOnly = addProperty({}, "whatever", { set: (value: string) => void(whatever(value)) });
 * type WithSetterOnly = {
 *    whatever: string;
 *    whateverIsWriteOnly?: undefined;
 * }
 * ```
 * So you get a reminder without breaking anything too hard.
 */
export type IfWriteOnlyDescriptor<T, D extends TypedPropertyDescriptor<unknown>> = D extends SetPropertyDescriptor<unknown> ? T : never;

/**
 * Produce the keys for the given property descriptors record which
 * would produce read-only properties.
 */
export type ReadOnlyDescriptorsKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in K]: IfReadOnlyDescriptor<key, R[key]>;
}[K] : never;

/**
 * Produce the keys for the given property descriptors record which
 * would produce read-write (or write-only) properties.
 */
export type ReadWriteDescriptorsKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in K]: IfReadWriteDescriptor<key, R[key]>;
}[K] : never;

/**
 * Produce the <strong>mangled</strong> keys for the given property
 * descriptors record which would produce write-only properties.
 * See {@link RenameIfWriteOnlyDescriptor} for details on the mangling.
 */
export type RenamedWriteOnlyDescriptorsKeys<R> = R extends Record<infer K, TypedPropertyDescriptor<unknown>> ? {
	[key in string & K]: RenameIfWriteOnlyDescriptor<key, R[key]>;
}[string & K] : never;

/**
 * Produce a single-property object type for the given property
 * descriptor.  Note: will produce an additional mangled pseudo-property
 * for write-only properties.
 * See {@link RenameIfWriteOnlyDescriptor} for details on the mangling.
 */
export type PropertyFromDescriptor<K extends string, D extends TypedPropertyDescriptor<unknown>> = D extends TypedPropertyDescriptor<infer V> ? ({
	readonly [key in IfReadOnlyDescriptor<K, D>]: V;
} & {
	[key in IfReadWriteDescriptor<K, D>]: V;
} & {
	[key in RenameIfWriteOnlyDescriptor<K, D>]?: undefined;
}) : never;

/**
 * Produce an object with the properties described by the descriptors.
 * See {@link RenameIfWriteOnlyDescriptor} for details on the mangling
 * of write-only properties.
 */
export type PropertiesFromDescriptors<R extends Record<string, TypedPropertyDescriptor<unknown>>> = {
	readonly [K in ReadOnlyDescriptorsKeys<R>]: R[K] extends TypedPropertyDescriptor<infer V> ? V : never;
} & {
	[K in ReadWriteDescriptorsKeys<R>]: R[K] extends TypedPropertyDescriptor<infer V> ? V : never;
} & {
	[K in RenamedWriteOnlyDescriptorsKeys<R>]?: undefined;
};

/**
 * A more type-friendly version of <kbd>Object.defineProperty</kbd>.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty Object.defineProperty on MDN}
 */
export const addProperty = <T, K extends string, V, D extends TypedPropertyDescriptor<V>>(target: T, key: K, descriptor: D): Resolve<T & PropertyFromDescriptor<K, D>> => {
	return Object.defineProperty(target, key, descriptor) as Resolve<T & PropertyFromDescriptor<K, D>>;
};

/**
 * A more type-friendly version of <kbd>Object.defineProperties</kbd>.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties Object.defineProperties on MDN}
 */
export const addProperties = <T, K extends string, R extends Record<K, TypedPropertyDescriptor<unknown>>>(target: T, descriptors: R): Resolve<T & PropertiesFromDescriptors<R>> => {
	return Object.defineProperties(target, descriptors) as Resolve<T & PropertiesFromDescriptors<R>>;
};
