import * as process from "node:process";

/**
 * Configuration for a {@link positionalArgs} call.
 */
export type PositionalArgsConfig = {
	/**
	 * Do not consider "." a positional arg.
	 * @defaultValue true
	 */
	ignoreDot?: boolean;
}

/**
 * Try to find command line arguments which look like positionals.
 * This is super, duper basic and only useful in very simple scenarios
 * where you expect mostly positionals and no interesting flag
 * configurations.
 */
export const positionalArgs = (
	args: string[] = process.argv.slice(2),
	config: PositionalArgsConfig = {},
): string[] => {
	const remaining = args.slice();
	const positionals: string[] = [];
	const ignoreDot = config.ignoreDot ?? true;
	let arg: string | undefined;
	while ((arg = remaining.shift()) != null) {
		if (arg.startsWith("--")) {
			if (!arg.includes("=")) {
				remaining.shift();
			}
		} else if (arg.startsWith("-")) {
			if (arg.length === 2) {
				// A flag?
			} else if (!arg.includes("=")) {
				remaining.shift();
			}
		} else if (arg !== "." || !ignoreDot) {
			positionals.push(arg);
		}
	}
	return positionals;
};
