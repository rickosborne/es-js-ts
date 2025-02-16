import { hasString } from "@rickosborne/guard";
import type { JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { assignThenContinue } from "./assign-then-continue.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { positiveIntAssertion } from "./evaluation-assertion.js";
import { getLanguage } from "./get-language.js";
import type { RunStateContext } from "./run-types.js";
import { isIsoDateTime, isJSONataString, JSONATA, JSONPATH, type WaitState } from "./sfn-types.js";

/**
 * Run the given Wait State.
 */
export const runWait = async (
	context: RunStateContext<WaitState>,
): Promise<JSONSerializable> => {
	const { input, options, state, stateName } = context;
	const language = getLanguage(context);
	const { Seconds: seconds, Timestamp: timestamp } = state;
	const secondsPath = hasString(state, "SecondsPath") ? state.SecondsPath : undefined;
	const timestampPath = hasString(state, "TimestampPath") ? state.TimestampPath : undefined;
	let until: Date;
	let sec: number | undefined;
	const now = () => (options.nowProvider?.() ?? Date.now());
	if ([ seconds, timestamp, secondsPath, timestampPath ].filter((v) => v != null).length > 1) {
		throw new SyntaxError(`Wait state ${ stateName } must have exactly one of: Seconds, SecondsPath, Timestamp`);
	} else if (seconds != null) {
		if (isJSONataString(seconds)) {
			assertLanguage(language, JSONATA, "Seconds");
			sec = await evaluateJSONata(seconds, { input, state }, positiveIntAssertion("Seconds", stateName));
			until = new Date(now() + (sec * 1_000));
		} else {
			sec = seconds;
			until = new Date(now() + (seconds * 1_000));
		}
	} else if (timestamp != null) {
		if (isJSONataString(timestamp)) {
			assertLanguage(language, JSONATA, "Timestamp");
			until = new Date(Date.parse(await evaluateJSONata(timestamp, { input, state }, {
				expected: "an ISO8601 timestamp",
				fieldName: "Timestamp",
				predicate: isIsoDateTime,
				stateName,
			})));
		} else if (isIsoDateTime(timestamp)) {
			until = new Date(Date.parse(timestamp));
		} else {
			throw new SyntaxError(`Wait state ${ stateName } Timestamp must be in ISO8601 format`);
		}
	} else if (secondsPath != null) {
		assertLanguage(language, JSONPATH, "SecondsPath");
		const value = evaluateJSONPath(secondsPath, { input, options });
		if (typeof value !== "number" || value < 0 || !Number.isSafeInteger(value)) {
			throw new SyntaxError(`Wait state ${ stateName } SecondsPath must resolve to a positive integer`);
		}
		sec = value;
		until = new Date(now() + (value * 1_000));
	} else if (timestampPath != null) {
		assertLanguage(language, JSONPATH, "TimestampPath");
		const value = evaluateJSONPath(timestampPath, { input, options });
		if (!isIsoDateTime(value)) {
			throw new SyntaxError(`Wait state ${ stateName } TimestampPath must resolve to an ISO8601 timestamp`);
		}
		until = new Date(Date.parse(value));
	} else {
		throw new SyntaxError(`Wait state ${ stateName } must have Seconds or Timestamp`);
	}
	await options.onWait?.(until, sec);
	return assignThenContinue({ ...context, errorOutput: undefined, output: input });
};
