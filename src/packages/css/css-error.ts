export interface CSSErrorOptions extends ErrorOptions {
	expected?: string | undefined;
	href?: string | undefined;
	message?: string | undefined;
}

export class CSSError extends Error {
	public override readonly name = "CSSError";
	public readonly expected: string | undefined;
	public readonly href: string | undefined;

	constructor(
		public readonly text?: string | undefined,
		options: CSSErrorOptions = {},
	) {
		const message = options.message ?? (text == null ? "Error in CSS" : `Error in CSS: ${text}`);
		super(message);
		this.expected = options.expected;
		this.href = options.href;
	}
}
