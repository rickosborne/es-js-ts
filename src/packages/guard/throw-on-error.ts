/**
 * Mixin added to function call options to indicate whether it should
 * throw, or silently swallow the error.
 */
export interface ThrowOnError {
	throwOnError?: boolean;
}

// This is distinct from NO_THROW below due to a bug in api-extractor:
// https://github.com/microsoft/rushstack/issues/5077
const DO_NOT_THROW = Object.freeze({
	throwOnError: false,
} as const satisfies ThrowOnError);

/**
 * Value of {@link ThrowOnError} which will avoid throwing.
 */
export const NO_THROW = DO_NOT_THROW;
