import type { Either } from "@rickosborne/typical";

/**
 * Mixin for a parameter which is not required.
 */
type OptionalParam = {
	optional: true;
};

/**
 * Extend a param's return type to allow for undefined if the param
 * is optional.
 * @internal
 */
export type IfOptional<T, U> = T extends OptionalParam ? (U | undefined) : U;

/**
 * Mixin for a parameter which may be repeated.
 */
type RepeatedParam = {
	multiple: true;
};

/**
 * Extend a parameter's return type to an array if the param may be repeated.
 * @internal
 */
export type IfRepeated<T, U> = T extends RepeatedParam ? U[] : U;

type CommandParamWithNames = {
	name?: string;
	names?: string;
	positional?: false;
};

/**
 * A parameter which accepts positional values.
 */
export type PositionalCommandParam = {
	positional: true;
};

/**
 * Mixin of properties which can be used to build `--help` text.
 */
export type DescribedParam = {
	help?: string;
	placeholder?: string;
}

/**
 * Mixin for any type of command-line parameter.
 */
export type CommandParamBase = Either<CommandParamWithNames, PositionalCommandParam> & Partial<OptionalParam> & Partial<RepeatedParam> & DescribedParam;

/**
 * @internal
 */
export type TypedCommandParam = CommandParamBase & { type?: unknown };


/**
 * Central logic for a single type of {@link CommandParam}
 * @internal
 */
export type ParamHandler<P extends TypedCommandParam, V> = {
	matchesParam(this: void, param: TypedCommandParam): param is P;
	parseArg(this: void, text: string, param: P): V;
	placeholderForParam(this: void, param: P): string | undefined;
}
