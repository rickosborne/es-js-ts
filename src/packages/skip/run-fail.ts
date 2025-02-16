import { hasString } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { assertNullUndef } from "./assert-null-undef.js";
import { assignThenContinue } from "./assign-then-continue.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { stringAssertion } from "./evaluation-assertion.js";
import { getLanguage } from "./get-language.js";
import type { RunStateContext } from "./run-types.js";
import { type ErrorOutput, type FailState, isJSONataString, JSONATA, JSONPATH, STATES_BRANCH_FAILED } from "./sfn-types.js";

/**
 * Run the given Fail State.
 */
export const runFail = async (
	context: RunStateContext<FailState>,
): Promise<JSONSerializable> => {
	const { input, state, stateName } = context;
	const language = getLanguage(context);
	const { Cause: cause, Error: error } = state;
	const errorPath = hasString(state, "ErrorPath") ? state.ErrorPath : undefined;
	const causePath = hasString(state, "CausePath") ? state.CausePath : undefined;
	const errorOutput: ErrorOutput = {
		...(cause == null ? {} : { Cause: cause }),
		Error: error ?? STATES_BRANCH_FAILED,
	};
	if (isJSONataString(error)) {
		assertLanguage(language, JSONATA, "Error");
		errorOutput.Error = await evaluateJSONata(error, context, stringAssertion("Error", stateName));
	}
	if (isJSONataString(cause)) {
		assertLanguage(language, JSONATA, "Cause");
		errorOutput.Cause = await evaluateJSONata(cause, context, stringAssertion("Cause", stateName));
	}
	if (errorPath != null) {
		assertLanguage(language, JSONPATH, "ErrorPath");
		assertNullUndef(error, () => new SyntaxError(`Fail state ${ stateName } may have either Error or ErrorPath, not both`));
		errorOutput.Error = evaluateJSONPath(errorPath, context, stringAssertion("ErrorPath", stateName));
	}
	if (causePath != null) {
		assertLanguage(language, JSONPATH, "CausePath");
		assertNullUndef(cause, () => new SyntaxError(`Fail state ${ stateName } may have either Cause or CausePath, not both`));
		errorOutput.Cause = evaluateJSONPath(causePath, context, stringAssertion("CausePath", stateName));
	}
	return assignThenContinue({ ...context, errorOutput, output: input });
};
