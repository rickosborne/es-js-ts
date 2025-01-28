import { Rebound } from "./rebound.js";

export const int255 = Rebound.buildType("Int255").fromInclusive(0).toInclusive(255).integers().build();
export const toInt255 = int255.fromNumberWith({ ifPresent: true });
export const {
	assert: assertInt255,
	guard: isInt255,
} = int255;

/**
 * An integer in the range [0,255].
 */
export type Int255 = typeof int255.numberType;
