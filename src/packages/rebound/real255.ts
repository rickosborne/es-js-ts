import { Rebound } from "./rebound.js";

export const real255 = Rebound.buildType("Real255").fromInclusive(0).toInclusive(255).reals().build();
export const toReal255 = real255.fromNumberWith({ ifPresent: true });
export const {
	assert: assertReal255,
	guard: isReal255,
} = real255;

/**
 * A real number in the range [0,255].
 */
export type Real255 = typeof real255.numberType;
