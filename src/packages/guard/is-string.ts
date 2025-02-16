/**
 * Type guard for a string value.  Just calls `typeof`, but could
 * make complicated type guard compositions easier to read.
 */
export const isString = (value: unknown): value is string => typeof value === "string";
