import * as process from "node:process";

export const positionalArgs = (
	args: string[] = process.argv.slice(2),
): string[] => {
	const remaining = args.slice();
	const positionals: string[] = [];
	let arg: string | undefined;
	while ((arg = remaining.shift()) != null) {
		if (arg.startsWith("--")) {
			if (!arg.includes("=")) {
				args.shift();
			}
		} else if (!arg.startsWith("-") && arg !== ".") {
			positionals.push(arg);
		}
	}
	return positionals;
};
