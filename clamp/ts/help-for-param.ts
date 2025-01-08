import type { CommandParam } from "./command-params.js";
import { findParamHandler } from "./param-handler.js";

/**
 * @internal
 */
export const helpForParam = (names: string[], param: CommandParam): string | undefined => {
	const { help } = param;
	if (help == null) {
		return undefined;
	}
	const handler = findParamHandler(param);
	const placeholder = handler.placeholderForParam(param);
	const lines: string[] = [];
	for (const name of names.toSorted()) {
		let line = "  ";
		if (name.length === 1) {
			line = line.concat("-", name);
		} else {
			line = line.concat("--", name);
		}
		if (placeholder != null) {
			line = line.concat(" ", placeholder);
		}
		lines.push(line);
	}
	lines.push("    ".concat(help));
	return lines.join("\n");
};
