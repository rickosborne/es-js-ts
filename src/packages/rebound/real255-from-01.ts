import type { Real01 } from "./real01.js";
import { real01 } from "./real01.js";
import type { Real255 } from "./real255.js";
import { real255 } from "./real255.js";

/**
 * Convert a {@link Real01} to a {@link Real255}.
 */
export const real255From01 = (value: Real01): Real255 => real255.range.scaleValueFrom(value, real01.range) as Real255;
