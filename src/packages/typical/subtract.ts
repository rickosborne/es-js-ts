import type { SharedKeys } from "./keys.js";

/**
 * Remove all properties from the left type which have keys shared with the right type.
 */
export type Subtract<Left extends object, Right extends object> = Omit<Left, SharedKeys<Left, Right>>;
