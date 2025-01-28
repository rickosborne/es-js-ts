import { assertDefined } from "@rickosborne/guard";
import type { BooleanCommandParam } from "./boolean-param.js";
import { FALSES, TRUES } from "./boolean-param.js";
import type { IfOptional, IfRepeated } from "./common.js";
import type { DateCommandParam } from "./date-param.js";
import type { FileArg, FileCommandParam } from "./file-param.js";
import { labelForParam } from "./label-for-param.js";
import type { NumberCommandParam } from "./number-param.js";
import { findParamHandler } from "./param-handler.js";
import type { StringCommandParam } from "./string-param.js";

/**
 * One of the built-in param types.
 */
export type CommandParam = StringCommandParam | NumberCommandParam | BooleanCommandParam | FileCommandParam | DateCommandParam;

/**
 * @internal
 */
export type CommandParamsSpec = Record<string, CommandParam>;

/**
 * A parser function for a specific type of param.
 */
export type CommandParamParser<Param extends CommandParam, Return> = (text: string, param: Param) => Return;

/**
 * @internal
 */
export type HasCommandParamParser<Param extends CommandParam, Return> = { parse?: CommandParamParser<Param, Return> };

/**
 * Computed return type for a param.
 */
export type CommandParamReturn<Param extends CommandParam> = Param extends HasCommandParamParser<Param, infer Return> ? IfRepeated<Param, Return>
	: Param["type"] extends typeof Boolean ? IfOptional<Param, IfRepeated<Param, boolean>>
		: Param["type"] extends typeof Date ? IfOptional<Param, IfRepeated<Param, Date>>
			: Param["type"] extends typeof Number ? IfOptional<Param, IfRepeated<Param, number>>
				: Param["type"] extends "file" ? IfOptional<Param, IfRepeated<Param, FileArg>>
					: Param["type"] extends typeof String ? IfOptional<Param, IfRepeated<Param, string>>
						: undefined extends Param["type"] ? IfOptional<Param, IfRepeated<Param, string>>
							: never;

/**
 * Computed return (Record) type for a Record of params.
 */
export type CommandParamsReturn<Params extends object> = {
	[K in keyof Params]: Params[K] extends CommandParam ? CommandParamReturn<Params[K]> : never;
}

const toReturnType = (text: string, param: CommandParam): unknown => {
	const paramHandler = findParamHandler(param);
	const parser = (param.parse ?? paramHandler.parseArg) as CommandParamParser<CommandParam, unknown> | undefined;
	if (parser != null) {
		return parser(text, param);
	}
	throw new Error(`Unhandled param type: ${ String(param.type) }`);
};

/**
 * Parse the (maybe-given) command-line arguments according to the
 * given param specs and construct a return type of the converted values.
 */
export const commandParams = <Spec extends CommandParamsSpec>(
	spec: Spec,
	{
		args = process.argv.slice(2),
		ignoreUnknown,
		onError,
	}: {
		args?: string[],
		ignoreUnknown?: boolean,
		onError?: (error: Error) => void,
	} = {},
): CommandParamsReturn<Spec> => {
	const result = {} as Record<string, unknown>;
	const positionals = Object.entries(spec)
		.filter(([ , s ]) => s.positional === true)
		.map(([ key, s ]) => ({ key, spec: s }));
	if (positionals.length > 1) {
		throw new Error(`Too many positionals: ${ positionals.map(({ key }) => key).join(" ") }`);
	}
	const positional = positionals.shift();
	let onlyPositionalsRemain = false;
	try {
		while (args.length > 0) {
			const arg = args.shift()!;
			let param: CommandParam | undefined;
			let resultKey: string | undefined;
			let typedValue: unknown;
			if (arg === "--" && !onlyPositionalsRemain) {
				onlyPositionalsRemain = true;
				continue;
			}
			if (onlyPositionalsRemain || !arg.startsWith("-")) {
				if (positional == null) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`Unexpected positional: ${ JSON.stringify(arg) }`);
				}
				param = positional.spec;
				resultKey = positional.key;
				typedValue = toReturnType(arg, positional.spec);
			} else {
				let no = false;
				let name: string;
				if (arg.startsWith("--no-")) {
					name = arg.substring(5);
					no = true;
				} else if (arg.startsWith("--")) {
					name = arg.substring(2);
				} else if (arg.startsWith("-no-")) {
					name = arg.substring(4);
					no = true;
				} else {
					name = arg.substring(1);
				}
				let suffix: string | undefined;
				if (name.includes("=")) {
					[ name, suffix ] = name.split("=", 2) as [string, string];
				}
				const specs = Object.entries(spec)
					.filter(([ n, s ]) => "name" in s && s.name === name || ("names" in s && (s.names?.includes(name) ?? false)) || n === name);
				if (specs.length < 1) {
					if (ignoreUnknown) {
						continue;
					}
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`Unexpected arg: ${ JSON.stringify(name) }`);
				}
				if (specs.length > 1) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`More than one matching spec: ${ name }`);
				}
				[ resultKey, param ] = specs[ 0 ];
				assertDefined(param, `param: ${ name }`);
				let stringValue: string | undefined;
				if (param.type === Boolean) {
					if (no) {
						if (suffix != null) {
							// noinspection ExceptionCaughtLocallyJS
							throw new Error(`Combo of "no" plus "=" does not make any sense for ${ labelForParam(param) }`);
						}
						stringValue = param.falseText ?? param.falses?.[ 0 ] ?? FALSES[ 0 ];
					} else {
						stringValue = suffix ?? param.trueText ?? param.trues?.[ 0 ] ?? TRUES[ 0 ];
					}
				} else if (no) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`"no" does not make sense for ${ labelForParam(param) }`);
				} else {
					stringValue = suffix ?? args.shift();
				}
				assertDefined(stringValue, () => `value for ${ labelForParam(param!) }`);
				typedValue = toReturnType(stringValue, param);
			}
			if (param == null || resultKey == null) {
				if (ignoreUnknown) {
					continue;
				}
				// noinspection ExceptionCaughtLocallyJS
				throw new Error(`Unexpected arg: ${ JSON.stringify(arg) }`);
			}
			assertDefined(typedValue, `typedValue for ${ resultKey }`);
			const existing = result[ resultKey ];
			if (param.multiple === true) {
				const values = existing ?? [];
				if (!Array.isArray(values)) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`Expected an array: ${ resultKey }`);
				}
				result[ resultKey ] ??= values;
				values.push(typedValue);
			} else {
				if (existing != null) {
					// noinspection ExceptionCaughtLocallyJS
					throw new Error(`Too many ${ labelForParam(param) }: ${ JSON.stringify(existing) } ${ JSON.stringify(arg) }`);
				}
				result[ resultKey ] = typedValue;
			}
		}
		const requiredKeys = Object.entries(spec)
			.filter(([ , s ]) => s.optional !== true)
			.map(([ key ]) => key);
		const missing = requiredKeys.filter((key) => !(key in result));
		if (missing.length > 0) {
			const message = missing
				.map((key) => spec[key])
				.map((p) => p == null ? "" : labelForParam(p)).join(" ");
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`Missing required params: ${ message }`);
		}
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error("Unknown error");
		if (onError != null) {
			onError(error);
			return undefined as unknown as CommandParamsReturn<Spec>;
		} else {
			console.error(error.message);
			process.exit(1);
		}
	}
	return result as CommandParamsReturn<Spec>;
};
