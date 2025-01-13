export interface ColorConversionErrorOptions extends ErrorOptions {
	message?: string;
}

export class ColorConversionError extends Error {
	public override readonly name = "ColorConversionError";

	constructor(public readonly format: string, public readonly given: unknown, options: ColorConversionErrorOptions = {}) {
		const message = options.message ?? `Color conversion to ${ format } failed`;
		super(message);
	}
}
