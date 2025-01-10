import type { Sign } from "./2d.js";

/**
 * Reduce a number to a unit (1) with a sign.
 */
export const signOf = (n: number): Sign => isNaN(n) ? NaN as Sign : n === 0 ? 0 : n < 0 ? -1 : 1;
