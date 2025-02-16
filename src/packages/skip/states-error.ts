/**
 * Generic error for "something went wrong while executing a State Machine".
 * Its `name` will always be one of the reserved `States.*` errors.
 */
export class StatesError extends Error {
	public override readonly name: string;

	public constructor(name: string, message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = name;
	}
}
