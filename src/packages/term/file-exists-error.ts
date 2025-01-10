/**
 * Options for the {@link FileExistsError} constructor.
 */
export interface FileConflictErrorOptions extends ErrorOptions {
	message?: string;
}

/**
 * An error thrown when a file is expected to not exist, but does.
 */
export class FileExistsError extends Error {
	public override readonly name = "FileExistsError";

	constructor(
		public readonly filePath: string,
		public readonly sourcePath: string,
		options: FileConflictErrorOptions = {},
	) {
		const message = options.message ?? `File already exists: ${ filePath }`;
		super(message, options);
	}
}
