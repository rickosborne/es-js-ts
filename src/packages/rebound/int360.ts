import { Rebound } from "./rebound.js";

export const int360 = Rebound.buildType("Int360").integers().fromInclusive(0).toInclusive(359).build();
export const toInt360 = int360.fromNumberWith({ ifPresent: true });
export const {
	assert: assertInt360,
	guard: isInt360,
} = int360;

/**
 * An integer in the range [0,360).
 */
export type Int360 = typeof int360.numberType;
