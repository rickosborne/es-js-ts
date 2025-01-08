import { booleanParamHandler } from "./boolean-param.js";
import type { ParamHandler, TypedCommandParam } from "./common.js";
import { dateParamHandler } from "./date-param.js";
import { fileParamHandler } from "./file-param.js";
import { numberParamHandler } from "./number-param.js";
import { stringParamHandler } from "./string-param.js";

const paramHandlers: ParamHandler<TypedCommandParam, unknown>[] = [
	stringParamHandler,
	booleanParamHandler,
	numberParamHandler,
	fileParamHandler,
	dateParamHandler,
];

/**
 * @internal
 */
export const findParamHandler = <P extends TypedCommandParam>(param: P): ParamHandler<P, unknown> => {
	const paramHandler = paramHandlers.find((ph): boolean => ph.matchesParam(param)) as ParamHandler<P, unknown> | undefined;
	if (paramHandler == null) {
		throw new TypeError(`Unknown parameter type: ${ param.type?.toString() }`);
	}
	return paramHandler;
};
