/* eslint-disable @typescript-eslint/no-redundant-type-constituents,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unnecessary-type-constraint */
import type { BuiltIn } from "./built-in.js";

/**
 * Try to coerce tsc into showing an integrated type,
 * instead of a type intersection / union / etc.
 */
export type Resolve<T extends any, Seen = never> = T extends BuiltIn ? T
	: [T] extends [Seen] ? T
	: T extends any[] ? T extends Record<string | number | symbol, any>[] ? ({[K in keyof T[number]]: Resolve<T[number][K], T | Seen>} & unknown)[] : T
	: T extends readonly any[] ? T extends readonly Record<string | number | symbol, any>[] ? readonly ({[K in keyof T[number]]: Resolve<T[number][K], T | Seen>} & unknown)[] : T
	: { [K in keyof T]: Resolve<T[K], T | Seen> } & unknown;
