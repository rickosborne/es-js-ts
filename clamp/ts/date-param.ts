import { type ParseLocalDateConfig, parseLocalDate } from "@rickosborne/foundation";
import type { CommandParamBase, ParamHandler, TypedCommandParam } from "./common.js";
import { labelForParam } from "./label-for-param.js";

/**
 * Command-line parameter which can accept a date (and optionally time) value.
 */
export type DateCommandParam = CommandParamBase & ParseLocalDateConfig & {
	/**
	 * Maximum acceptable value.
	 */
	maximum?: Date;
	/**
	 * Minimum acceptable value.
	 */
	minimum?: Date;
	/**
	 * Convert the text argument to the date it represents.
	 * @defaultValue {@link parseDateArg}
	 */
	parse?: (this: void, text: string, param: DateCommandParam) => Date;
	type: typeof Date;
}

/**
 * @internal
 */
export const parseDateArg = (text: string, param: DateCommandParam): Date => {
	const date = parseLocalDate(text, param);
	if (param.minimum != null && date < param.minimum) {
		throw new RangeError(`${ labelForParam(param) }: minimum=${ param.minimum.toISOString() }`);
	}
	if (param.maximum != null && date > param.maximum) {
		throw new RangeError(`${ labelForParam(param) }: maximum=${ param.maximum.toISOString() }`);
	}
	return date;
};

/**
 * @internal
 */
export const isDateParam = (param: TypedCommandParam): param is DateCommandParam => {
	return param.type === Date;
};

/**
 * @internal
 */
export const dateParamHandler: ParamHandler<DateCommandParam, Date> = {
	matchesParam: isDateParam,
	parseArg: parseDateArg,
	placeholderForParam(param: DateCommandParam): string | undefined {
		return param.placeholder ?? param.time ? "(datetime)" : "(date)";
	},
};
