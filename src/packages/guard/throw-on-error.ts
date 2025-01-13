/**
 * Mixin added to function call options to indicate whether it should
 * throw, or silently swallow the error.
 */
export interface ThrowOnError {
	throwOnError?: boolean;
}

/**
 * Value of {@link ThrowOnError} which will avoid throwing.
 */
export const NO_THROW = {
	throwOnError: false,
} satisfies ThrowOnError;
