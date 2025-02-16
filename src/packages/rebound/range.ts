import { INT_SET, LOWER_EX, LOWER_IN, REAL_SET, UPPER_EX, UPPER_IN } from "./spec.js";
import type { BoundsConfig, BoundsLabel, CheckedBounds, DefinedFromCheckedConfig, LowerInEx, NumberSet, UpperInEx } from "./spec.js";

export const rangeFromConfig = <
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
	Config extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>,
>(config: Config): BoundsLabel<Config> => {
	const { lower, lowerInc, int, upper, upperInc } = config;
	return `${ lowerInc }${ lower === -Infinity ? "-∞" : lower }${ int === INT_SET ? ".." : "," }${ upper === Infinity ? "+∞" : upper }${ upperInc }` as BoundsLabel<Config>;
};

export const rangeFromChecked = <Config extends CheckedBounds>(config: CheckedBounds): BoundsLabel<DefinedFromCheckedConfig<Config>> => {
	const { isInt, isLowerInc, isUpperInc, lower, upper } = config;
	return rangeFromConfig({
		lowerInc: isLowerInc ? LOWER_IN : LOWER_EX,
		"int": isInt ? INT_SET : REAL_SET,
		lower,
		upper,
		upperInc: isUpperInc ? UPPER_IN : UPPER_EX,
	});
};

