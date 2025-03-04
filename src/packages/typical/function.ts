/**
 * Function which evaluates a value against a condition.
 */
export type UnaryPredicate<T> = (value: T) => boolean;

/**
 * Shorthand for {@link UnaryPredicate}.
 */
export type Predicate<T> = UnaryPredicate<T>;

/**
 * Function which evaluates two values against a condition.
 */
export type BiPredicate<T, U> = (t: T, u: U) => boolean;

/**
 * Function which evaluates a value and its position against a condition.
 * Typically used for array or iterator filters.
 */
export type IndexedPredicate<T> = (value: T, index: number) => boolean;

/**
 * Function which returns a given type without any input.
 */
export type Supplier<T> = () => T;

/**
 * Function which accepts the given input type without any output.
 */
export type UnaryConsumer<T> = (value: T) => void;

/**
 * Shorthand for {@link UnaryConsumer}.
 */
export type Consumer<T> = UnaryConsumer<T>;

/**
 * Function which accepts the given input type without any output.
 */
export type BiConsumer<T, U> = (t: T, u: U) => void;

/**
 * Function which accepts the given input type without any output.
 */
export type TriConsumer<T, U, V> = (t: T, u: U, v: V) => void;

/**
 * Function which accepts the given type and returns the same.
 */
export type UnaryOperator<T> = (value: T) => T;

/**
 * Function which accepts two of the given type and returns the same.
 */
export type BinaryOperator<T> = (left: T, right: T) => T;

/**
 * Anything which could be called like a function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...params: any) => unknown;

/**
 * A function-like value which accepts the given parameter type(s)
 * and produces the given return type.
 */
export type FunctionLike<Params extends unknown[], Return> = (...params: Params) => Return;

/**
 * A constructor-like value which, when invoked via <kbd>new</kbd>,
 * accepts the given parameter type(s) and produces the given instance type.
 */
export type ConstructorLike<Params extends unknown[], Instance> = new (...params: Params) => Instance;
export type AbstractConstructorLike<Params extends unknown[], Instance> = abstract new (...params: Params) => Instance;
export type AnyConstructorLike<Params extends unknown[], Instance> = ConstructorLike<Params, Instance> | AbstractConstructorLike<Params, Instance>;

/**
 * Infer the types of the given function's parameters, in a tuple.
 */
export type FunctionParams<F> = F extends FunctionLike<infer P, unknown> ? P : never;

/**
 * Infer the types of the given constructor's parameters, in a tuple.
 */
export type ConstructorParams<C> = C extends ConstructorLike<infer P, unknown> ? P : never;
