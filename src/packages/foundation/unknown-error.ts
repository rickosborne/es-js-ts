/**
 * Options for {@link UnknownError}.
 */
export interface UnknownErrorOptions extends ErrorOptions {
	message?: string | undefined;
	reason?: unknown;
}

/**
 * An error thrown when the root problem is unknown.
 */
export class UnknownError extends Error {
	public override readonly name = "UnknownError";
	public readonly reason: unknown;

	constructor(options: UnknownErrorOptions = {}) {
		const message = options.message ?? "Unknown Error";
		super(message, options);
		this.reason = options.reason;
	}
}
