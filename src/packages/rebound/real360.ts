import { Rebound } from "./rebound.js";

export const real360 = Rebound.buildType("Real360").fromInclusive(0).toExclusive(360).reals().build();
export const toReal360 = real360.fromNumberWith({ ifPresent: true });
export const {
	assert: assertReal360,
	guard: isReal360,
} = real360;

/**
 * A number in the range [0,360).
 */
export type Real360 = typeof real360.numberType;
