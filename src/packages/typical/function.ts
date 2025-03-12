/* eslint-disable @typescript-eslint/no-explicit-any */
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
export type ConcreteConstructorLike<Params extends unknown[], Instance> = new (...params: Params) => Instance;
export type AbstractConstructorLike<Params extends unknown[], Instance> = abstract new (...params: Params) => Instance;
export type AnyConstructorLike<Params extends unknown[], Instance> = ConcreteConstructorLike<Params, Instance> | AbstractConstructorLike<Params, Instance>;
/**
 * Note that this *will not* match classes with protected constructors.
 * As near as the author can tell, this is impossible to accomplish in TS.
 * Yes, this is infuriating if all you want is a type which would be the
 * equivalent of an `instanceof` check.
 */
export type AnyConstructor = AnyConstructorLike<any, any>;
/**
 * A concrete class with a public constructor.
 * This will *not* match an abstract class, or one with a private/protected constructor.
 */
export type ConcreteConstructorOf<Instance> = new (...params: any) => Instance;
/**
 * An abstract *or concrete* class with a public constructor.
 * This will *not* match a class with a private/protected constructor.
 */
export type AbstractConstructorOf<Instance> = abstract new (...params: any) => Instance;
/**
 * A class with a public constructor which would create instances of the `Instance` type.
 * Because TS considers `class A` to be a narrower version of `abstract class A`, this
 * is functionally equivalent to using `AbstractConstructorOf`.  However,
 * it's included here as an option for readability.
 */
export type AnyConstructorOf<Instance> = ConcreteConstructorOf<Instance> | AbstractConstructorOf<Instance>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Infer the types of the given function's parameters, in a tuple.
 */
export type FunctionParams<F> = F extends FunctionLike<infer P, unknown> ? P : never;
