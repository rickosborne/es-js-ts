/* eslint-disable @typescript-eslint/ban-types */
/**
 * Copied from {@link https://github.com/millsp/ts-toolbelt/blob/master/sources/Misc/BuiltIn.ts | ts-toolbox}.
 */
export type BuiltIn =
	| Date
	| Error
	| Function
	| Generator
	| {readonly [Symbol.toStringTag]: string}
	| RegExp
;
