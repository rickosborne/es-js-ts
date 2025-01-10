/**
 * Options for the {@link FileMissingError} constructor.
 */
export interface FileMissingErrorOptions extends ErrorOptions {
	message?: string;
}

/**
 * Error thrown if a file does not exist.
 */
export class FileMissingError extends Error {
	public override readonly name = "FileMissingError";

	constructor(public readonly filePath: string, options: FileMissingErrorOptions = {}) {
		const message = options.message ?? `File does not exist: ${ filePath }`;
		super(message, options);
	}
}
