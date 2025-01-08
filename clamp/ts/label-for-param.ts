import type { CommandParam } from "./command-params.js";

/**
 * @internal
 */
export const labelForParam = (param: CommandParam): string => {
	if (param.positional === true) {
		return "...";
	}
	const names = param.names ?? param.name == null ? [] : [ param.name ];
	return names
		.map((name) => (name.length === 1 ? "-" : "--").concat(name))
		.join("|");
};
