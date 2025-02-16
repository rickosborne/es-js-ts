/**
 * A problem encountered while attempting to validate a value against
 * a type guard/schema.
 */
export interface ValidationProblem {
	actualType?: string | undefined;
	expectedType?: string | undefined;
	message?: string | undefined;
	path?: string[] | undefined;
}

export const formatValidationProblem = (problem: ValidationProblem): string => {
	return `Validation error${problem.path == null ? "" : ` at ${problem.path.join(".")}`}: expected ${problem.expectedType} but found ${problem.actualType}`;
};

export interface ValidationErrorOptions extends ErrorOptions {
	message?: string | undefined;
}

/**
 * An error which collects any number of problems encountered while
 * attempting to validate a value against a type schema/guard.
 */
export class ValidationError extends Error {
	public override readonly name = "ValidationError";
	public readonly problems: ValidationProblem[];

	public constructor(problems: ValidationProblem[], options: ValidationErrorOptions = {}) {
		let message: string | undefined;
		if (options.message != null) {
			message = options.message;
		} else if (problems[0]?.message != null) {
			message = problems[0].message;
		} else if (problems[0] != null) {
			message = formatValidationProblem(problems[0]);
		} else {
			message = "ValidationError";
		}
		super(message, options);
		this.problems = problems;
	}
}
