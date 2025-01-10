import type { CommandParamBase, ParamHandler, TypedCommandParam } from "./common.js";
import { labelForParam } from "./label-for-param.js";

/**
 * A parameter which should be converted into a number.
 */
export type NumberCommandParam = CommandParamBase & {
	/**
	 * Whether an integer is expected.
	 * @defaultValue false
	 */
	integer?: boolean;
	/**
	 * Maximum acceptable value.
	 */
	maximum?: number;
	/**
	 * Minimum acceptable value.
	 */
	minimum?: number;
	/**
	 * Convert the text value to its numeric result form.
	 * @defaultValue {@link parseNumberArg}
	 */
	parse?: (this: void, text: string, param: NumberCommandParam) => number;
	/**
	 * The numeric base used by <kbd>parseInt</kbd>.
	 */
	radix?: number;
	type: typeof Number;
};

/**
 * Convert a text argument to a number.
 * @internal
 */
export const parseNumberArg = (text: string, param: NumberCommandParam): number => {
	const num = param.integer === true ? parseInt(text, param.radix) : parseFloat(text);
	if (param.minimum != null && num < param.minimum) {
		throw new RangeError(`${labelForParam(param)}: minimum=${param.minimum}`);
	}
	if (param.maximum != null && num > param.maximum) {
		throw new RangeError(`${labelForParam(param)}: maximum=${param.minimum}`);
	}
	return parseFloat(text);
};

/**
 * @internal
 */
export const isNumberParam = (param: TypedCommandParam): param is NumberCommandParam => {
	return param.type === Number;
};

/**
 * @internal
 */
export const numberParamHandler: ParamHandler<NumberCommandParam, number> = {
	matchesParam: isNumberParam,
	parseArg: parseNumberArg,
	placeholderForParam(param: NumberCommandParam): string | undefined {
		if (param.placeholder != null) {
			return param.placeholder;
		}
		let range: string;
		if (param.minimum != null && param.maximum != null) {
			range = `:[${param.minimum},${param.maximum}]`;
		} else if (param.minimum != null) {
			range = `≥${param.minimum}`;
		} else if (param.maximum != null) {
			range = `≤${param.maximum}`;
		} else {
			range = "";
		}
		if (param.integer) {
			return `(int${range})`;
		}
		return `(number${range})`;
	},
};
