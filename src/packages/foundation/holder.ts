/**
 * A structure which can hold any value type, even undefined,
 * and can itself be const, while still allowing the value to
 * be added later.
 */
export interface Holder<T> {
	isPresent(): this is ValuedHolder<T>;
	setValue(value: T): unknown;
	readonly value: T | undefined;
}

/**
 * A {@link Holder} without a value, yet.
 */
export interface EmptyHolder<T> extends Holder<T> {
	setValue(value: T): asserts this is ValuedHolder<T>;
	readonly value: undefined;
}

/**
 * A {@link Holder} whose value has been set.
 */
export interface ValuedHolder<T> extends Holder<T> {
	setValue(value: T): never;
	readonly value: T;
}

export function holder<T>(value: T): ValuedHolder<T>;
export function holder<T>(): EmptyHolder<T>;
export function holder<T>(): Holder<T> {
	let value = arguments[0] as T | undefined;
	let present = arguments.length > 0;
	return {
		isPresent(): this is ValuedHolder<T> {
			return present;
		},
		setValue(v: T): asserts this is ValuedHolder<T> {
			if (present) {
				throw new Error("Cannot setValue more than once");
			}
			present = true;
			value = v;
		},
		get value(): T | undefined {
			return present ? value : undefined;
		},
	};
}

