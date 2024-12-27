import type { Predicate } from "@rickosborne/typical";

const defaultKeepIf = (line: string): boolean => {
	return !line.includes("node:internal")
		&& (!line.includes("/node_modules/") || line.includes("@rickosborne/"));
};

/**
 * Wrap an Error in a proxy which cleans up the stack trace to be
 * more human-readable.  It filters out lines from third-party code,
 * so you can quickly see your own code in the call stack.
 * May optionally include some way of indicating additional lines
 * which should be removed, so a guard function could make itself
 * transparent, making it seem like the caller threw the error.
 * @param err - Some kind of Error.
 * @param removeIf - A matcher to indicate whether a line should be removed (not kept!).
 *    Generally, you'll pass in the name of the calling function, calling file, or similar.
 */
export const scrubStackTrace = <E extends Error>(
	err: E,
	removeIf?: Predicate<string> | RegExp | string | undefined,
): E => {
	let keepIf: Predicate<string>;
	if (typeof removeIf === "string") {
		keepIf = (line) => !line.includes(removeIf);
	} else if (removeIf instanceof RegExp) {
		keepIf = (line) => !removeIf.test(line);
	} else if (typeof removeIf === "function") {
		keepIf = (line) => !removeIf(line);
	} else {
		keepIf = () => true;
	}
	let scrubbedStack: string | undefined;
	return new Proxy<E>(err, {
		get(target: E, p: string | symbol): unknown {
			if (p !== "stack") {
				return target[ p as keyof E ];
			}
			if (scrubbedStack == null) {
				scrubbedStack = target.stack?.split("\n")
					.filter(defaultKeepIf)
					.filter(keepIf)
					.join("\n");
			}
			return scrubbedStack;
		},
	});
};
