import { STATES_QUERY_EVALUATION_ERROR } from "./sfn-types.js";
import { StatesError } from "./states-error.js";

export interface QueryEvaluationErrorOptions extends ErrorOptions {
	message?: string | undefined;
}

/**
 * Error thrown when a JSONata expression evaluation or parsing fails.
 */
export class QueryEvaluationError extends StatesError {
	public readonly expression: string;

	public constructor(expression: string, options: QueryEvaluationErrorOptions = {}) {
		const message = options.message ?? `Query Evaluation Error: ${expression}`;
		super(STATES_QUERY_EVALUATION_ERROR, message, options);
		this.expression = expression;
	}
}
