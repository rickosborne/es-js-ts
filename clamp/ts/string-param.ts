import type { CommandParamBase, ParamHandler, TypedCommandParam } from "./common.js";

/**
 * A parameter which accepts a text value.
 */
export type StringCommandParam = CommandParamBase & {
	/**
	 * Transform the return value before returning it.
	 * @defaultValue {@link parseStringArg}
	 */
	parse?: (this: void, text: string, param: StringCommandParam) => string;
	/**
	 * Trim the value before returning it.
	 */
	trim?: boolean;
	type?: typeof String;
};

/**
 * Transform a string argument before returning it.
 * @internal
 */
export const parseStringArg = (text: string, param: StringCommandParam): string => {
	let s = text;
	if (param.trim === true) {
		s = s.trim();
	}
	return s;
};

/**
 * @internal
 */
export const isStringParam = (param: TypedCommandParam): param is StringCommandParam => {
	return param.type === String || param.type == null;
};

/**
 * @internal
 */
export const stringParamHandler: ParamHandler<StringCommandParam, string> = {
	matchesParam: isStringParam,
	parseArg: parseStringArg,
	placeholderForParam(param: StringCommandParam): string | undefined {
		return param.placeholder ?? "(text)";
	},
};
