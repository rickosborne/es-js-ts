import { argv as processArgv, env as processEnv } from "node:process";

/**
 * Options for a call to {@link envOrArg}.
 */
export type EnvOrArgOptions = {
	allowBlank?: boolean;
	argv?: string[];
	env?: Record<string, string | undefined>;
}

/**
 * Value returned from {@link envOrArg} when an arg is present, but
 * it appears to be a flag instead of a param.
 */
export const ARG_FLAG = "<flag>";

/**
 * Best-effort attempt to find a configuration arg in both the
 * environment and the command-line, when you don't want to define
 * the entire parameter set.  Tries its best to do what you mean,
 * such as converting `SNAKE_CASE` environment params to `--kebab-case`
 * command line params and vice versa.
 * Returns {@link ARG_FLAG} if it appears the command line param
 * is present, but is actually a flag.
 */
export const envOrArg = (
	nameOrNames: string | string[],
	options: EnvOrArgOptions = {},
): string | undefined => {
	const names = Array.isArray(nameOrNames) ? nameOrNames : [ nameOrNames ];
	const env = options.env ?? processEnv;
	const argv = options.argv ?? processArgv.slice(2);
	const allowBlank = options.allowBlank ?? false;
	for (const name of names) {
		const envName = name.replace(/^-+/, "").replace(/-/g, "_").toUpperCase();
		const envValue = env[ name ] ?? env[ envName ];
		if (envValue != null && (allowBlank || envValue.trim() !== "")) {
			return envValue;
		}
		const convertedEnv = /^[_A-Z][_A-Z0-9]*$/.test(name) ? name.toLowerCase().replace(/_/g, "-").replace(/^-+|-+$/g, "") : name;
		const argName = convertedEnv.startsWith("-") ? convertedEnv : convertedEnv.length === 1 ? `-${ convertedEnv }` : `--${ convertedEnv }`;
		const argEq = argName.concat("=");
		const lastIndex = argv.length - 1;
		const args = argv.map((arg, index) => {
			if (index > 0 && argv[ index - 1 ] === argName) {
				if (arg.startsWith("-")) {
					return ARG_FLAG;
				}
				return arg;
			}
			if (arg.startsWith(argEq)) {
				return arg.substring(argEq.length);
			}
			if (index === lastIndex && arg === argName) {
				return ARG_FLAG;
			}
			return undefined;
		}).filter((arg) => arg != null && (allowBlank || arg.trim() !== ""));
		if (args.length === 1) {
			return args[ 0 ]!;
		}
		if (args.length > 1) {
			if (args.every((v) => v === ARG_FLAG)) {
				return ARG_FLAG;
			}
			throw new Error(`More than one: ${ argName }`);
		}
	}
	return undefined;
};
