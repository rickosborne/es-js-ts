import { Rebound } from "./rebound.js";

export const real01 = Rebound.buildType("Real01").fromInclusive(0).toInclusive(1).reals().build();
export const toReal01 = real01.fromNumberWith({ ifPresent: true });
export const {
	assert: assertReal01,
	guard: isReal01,
} = real01;

/**
 * A real number in the range [0,1].
 */
export type Real01 = typeof real01.numberType;
