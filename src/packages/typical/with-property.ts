/**
 * Extend the given type with a property of the given name and value type.
 * If the original type already had a property of that name, it is
 * replaced <strong>not</strong> union-ed.
 */
export type WithProperty<Original, Name extends string, Value> = Omit<Original, Name> & {
	[K in Name]: Value;
};

/**
 * Extend the given type with an optional property of the given name
 * and value type. If the original type already had a property of that
 * name, it is replaced <strong>not</strong> union-ed.
 */
export type WithOptionalProperty<Original, Name extends string, Value> = Omit<Original, Name> & {
	[K in Name]?: Value;
};

/**
 * Extend the given type with a read-only property of the given name
 * and value type. If the original type already had a property of that
 * name, it is replaced <strong>not</strong> union-ed.
 */
export type WithReadOnlyProperty<Original, Name extends string, Value> = Omit<Original, Name> & {
	readonly [K in Name]: Value;
};
