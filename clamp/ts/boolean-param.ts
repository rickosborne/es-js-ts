import type { CommandParamBase, ParamHandler, TypedCommandParam } from "./common.js";
import { labelForParam } from "./label-for-param.js";

/**
 * Default possible values for true.
 * @internal
 */
export const TRUES = Object.freeze([ "t", "true", "1", "y", "yes" ]);

// noinspection SpellCheckingInspection
/**
 * Default possible values for false.
 * @internal
 */
export const FALSES = Object.freeze([ "f", "false", "0", "n", "no" ]);

/**
 * A command-line parameter which will be converted to a Boolean.
 */
export type BooleanCommandParam = CommandParamBase & {
	// noinspection SpellCheckingInspection
	/**
	 * Possible values for false.
	 * @defaultValue {@link FALSES}
	 */
	falses?: string[];
	/**
	 * Text value passed to the parser for a negative, if not otherwise provided.
	 */
	falseText?: string;
	/**
	 * Convert the text value to its Boolean result form.
	 * @defaultValue {@link parseBooleanArg}
	 */
	parse?: (this: void, text: string, param: BooleanCommandParam) => boolean;
	placeholder?: undefined;
	/**
	 * Possible values for true.
	 * @defaultValue {@link TRUES}
	 */
	trues?: string[];
	/**
	 * Text value passed to the parser for a positive, if not otherwise provided.
	 */
	trueText?: string;
	type: typeof Boolean;
};

/**
 * @internal
 */
export const parseBooleanArg = (text: string, param: BooleanCommandParam): boolean => {
	const lower = text.toLocaleLowerCase();
	const trueValues = param.trues ?? TRUES;
	if (trueValues.includes(lower)) {
		return true;
	}
	const falseValues = param.falses ?? FALSES;
	if (falseValues.includes(lower)) {
		return false;
	}
	throw new RangeError(`${ labelForParam(param) }: invalid value`);
};

/**
 * @internal
 */
export const booleanParamHandler: ParamHandler<BooleanCommandParam, boolean> = {
	matchesParam(param: TypedCommandParam): param is BooleanCommandParam {
		return param.type === Boolean;
	},
	parseArg: parseBooleanArg,
	placeholderForParam(): string | undefined {
		return undefined;
	},
};
