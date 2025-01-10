/**
 * Options for the {@link NotFileError} constructor.
 */
export interface NotFileErrorOptions extends ErrorOptions {
	message?: string;
}

/**
 * Error thrown when a filesystem entry is expected to be a file,
 * but is not.
 */
export class NotFileError extends Error {
	public override readonly name = "NotFileError";

	constructor(public readonly filePath: string, options: NotFileErrorOptions = {}) {
		const message = options.message ?? `Not a file: ${ filePath }`;
		super(message);
	}
}
