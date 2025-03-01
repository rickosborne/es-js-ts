import { arrayUnique, deepEquals, deepMerge, FILL_BATCHES, intRange, randomNumberGenerator, StringTokenizer, toBatches } from "@rickosborne/foundation";
import { assertJSONSerializable, isDigit } from "@rickosborne/guard";
import type { JSONArray, JSONObject, JSONSerializable } from "@rickosborne/typical";
import * as jsonpath from "jsonpath";
import { createHash, randomUUID } from "node:crypto";
import { STATES_ARRAY, STATES_ARRAY_CONTAINS, STATES_ARRAY_GET_ITEM, STATES_ARRAY_LENGTH, STATES_ARRAY_PARTITION, STATES_ARRAY_RANGE, STATES_ARRAY_UNIQUE, STATES_BASE64_DECODE, STATES_BASE64_ENCODE, STATES_FORMAT, STATES_HASH, STATES_HASH_ALGORITHMS, STATES_INTRINSIC_FAILURE, STATES_JSON_MERGE, STATES_JSON_TO_STRING, STATES_MATH_ADD, STATES_MATH_RANDOM, STATES_STRING_SPLIT, STATES_STRING_TO_JSON, STATES_UUID, type StatesHashAlgorithm } from "./sfn-types.js";
import { StatesError } from "./states-error.js";

// ======================================================================
//  ___       _        _           _      _____                 _   _
// |_ _|_ __ | |_ _ __(_)_ __  ___(_) ___|  ____   _ _ __   ___| |_(_) ___  _ __  ___
//  | || '_ \| __| '__| | '_ \/ __| |/ __| |_ | | | | '_ \ / __| __| |/ _ \| '_ \/ __|
//  | || | | | |_| |  | | | | \__ | | (__|  _|| |_| | | | | (__| |_| | (_) | | | \__ \
// |___|_| |_|\__|_|  |_|_| |_|___|_|\___|_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
//
// ======================================================================

/**
 * A literal value as an argument to an Intrinsic Function call.
 */
interface IntrinsicFunctionLiteralArg {
	type: "literal";
	value: string | number | null | boolean;
}

/**
 * A JSONPath expression as an argument to an Intrinsic Function call.
 */
interface IntrinsicFunctionPathArg {
	type: "path";
	value: string;
}

export type IntrinsicFunctionArg = IntrinsicFunctionLiteralArg | IntrinsicFunctionPathArg | IntrinsicFunctionCall;

export interface IntrinsicFunctionCall {
	args: IntrinsicFunctionArg[];
	fnName: string;
	type: "call";
}

const INTRINSIC_FUNCTION_NAME_PATTERN = /^[A-Za-z0-9._]+$/;
const MAYBE_PATH_TERM = Object.freeze([ ",", ")", " ", "\t" ]);

class IntrinsicFunctionTokenizer extends StringTokenizer {
	public static override forText(text: string): IntrinsicFunctionTokenizer {
		return new IntrinsicFunctionTokenizer(text[Symbol.iterator](), text);
	}

	/**
	 * Try to consume a number, int or double, starting at the current offset.
	 */
	public consumeNumber(): number {
		let sign = 1;
		if (this.tryConsume("-")) {
			sign = -1;
		} else if (this.tryConsume("+")) {
			// do nothing
		}
		const intDigits = this.consumeWhile(isDigit);
		if (intDigits === "") {
			throw new SyntaxError(`Expected a number at offset ${ this.at }: ${ this.text }`);
		}
		let result = Number.parseInt(intDigits, 10);
		if (this.tryConsume(".")) {
			const fracDigits = this.consumeWhile(isDigit);
			if (fracDigits !== "") {
				result += Number.parseFloat("0.".concat(fracDigits));
			}
		}
		if (sign < 0) {
			result = -result;
		}
		return result;
	}

	/**
	 * Consume a single-quoted string from the current offset, paying
	 * careful attention to escapes.
	 */
	public consumeString = (): string => {
		this.consumeExact("'");
		let text: string[] = [];
		let escapeNext = false;
		while (!this.done) {
			const char = this.consumeCount(1);
			if (char === "") {
				throw new SyntaxError(`Missing string terminator: ${ this.text }`);
			}
			if (escapeNext) {
				text.push(char);
				escapeNext = false;
				continue;
			}
			if (char === "'") {
				break;
			}
			if (char === "\\") {
				escapeNext = true;
				continue;
			}
			text.push(char);
		}
		return text.join("");
	};

	/**
	 * So ... yeah.  This ... cheats.
	 * We have a list of characters which _could_ appear in a JSONPath
	 * expression, but should never _terminate_ one.  Thus, we
	 * consume until we see one, check the accumulated expression
	 * for validity by trying to parse it, and return as soon as
	 * we see a valid expression.  It's ugly ... but it _should_
	 * mean we don't need to write our own JSONPath expression parser.
	 */
	public consumePath = (): string => {
		let pathExpr = this.consumeExact("$");
		const isDouble = this.tryConsume("$");
		while (!this.done) {
			const exprPart = this.consumeWhile((t) => !MAYBE_PATH_TERM.includes(t));
			if (exprPart === "") {
				// We ran out of string.
				break;
			}
			pathExpr = pathExpr.concat(exprPart);
			try {
				jsonpath.parse(pathExpr);
				if (isDouble) {
					return "$".concat(pathExpr);
				}
				return pathExpr;
			} catch (err: unknown) {
				const stops = this.consumeWhile((t) => MAYBE_PATH_TERM.includes(t));
				if (stops === "") {
					// We ran out of string here, too.
					break;
				}
				pathExpr = pathExpr.concat(stops);
			}
		}
		throw new SyntaxError(`Unexpected end of string while parsing JSONPath expression: ${ this.text }`);
	};

	/**
	 * Try to read an entire argument from the current offset.
	 * At this point, the type of the arg isn't known, so this function
	 * doesn't actually consume anything other than whitespace, commas,
	 * and closing parent.  Other than that, it peeks at the next
	 * character and delegates to the actual consumer.
	 */
	public consumeArg = (): IntrinsicFunctionArg | undefined => {
		const char = this.peek();
		if (char == null) {
			throw new SyntaxError(`Expected closing paren or another function argument at ${ this.at }: ${ this.text }`);
		}
		if (char === ")") return undefined;
		let result: IntrinsicFunctionArg;
		if (/^[-+0-9]$/.test(char)) {
			result = {
				type: "literal",
				value: this.consumeNumber(),
			};
		} else if (char === "'") {
			result = {
				type: "literal",
				value: this.consumeString(),
			};
		} else if (char === "$") {
			result = {
				type: "path",
				value: this.consumePath(),
			};
		} else if (this.tryConsume("null")) {
			result = {
				type: "literal",
				value: null,
			};
		} else if (this.tryConsume("true")) {
			result = {
				type: "literal",
				value: true,
			};
		} else if (this.tryConsume("false")) {
			result = {
				type: "literal",
				value: false,
			};
		} else if (INTRINSIC_FUNCTION_NAME_PATTERN.test(char)) {
			result = this.consumeCall();
		} else {
			throw new SyntaxError(`Not sure how to parse the arg at offset ${ this.at } of: ${ this.text }`);
		}
		this.consumeSpace();
		if (this.tryConsume(",")) {
			this.consumeSpace();
		}
		return result;
	};

	/**
	 * Consume an entire Intrinsic Function call.  These may be nested.
	 */
	public consumeCall = (): IntrinsicFunctionCall => {
		const fnName = this.consumeWhile((t) => INTRINSIC_FUNCTION_NAME_PATTERN.test(t));
		if (fnName === "") {
			throw new SyntaxError(`Intrinsic Function name expected: ${ this.text }`);
		}
		this.consumeSpace();
		this.consumeExact("(");
		const args: IntrinsicFunctionArg[] = [];
		let arg: IntrinsicFunctionArg | undefined;
		do {
			this.consumeSpace();
			arg = this.consumeArg();
			if (arg !== undefined) {
				args.push(arg);
			}
		} while (arg !== undefined);
		this.consumeSpace();
		this.consumeExact(")");
		this.consumeSpace();
		return { args, fnName, type: "call" };
	};
}

/**
 * Try to parse an Intrinsic Function call expression.
 * This is a very basic pull parser.
 * It's a little flaky, as the JSONPath expressions aren't quoted,
 * and the `jsonpath` library's `parse` function can't handle trailing
 * text like `,` or `)`.  And, of course, both `,` and `)` are
 * perfectly valid at places inside a JSONPath expression, so we can't
 * just look for the first one of those, either.
 */
export const parseIntrinsicFunctionExpression = (expr: string): IntrinsicFunctionCall => {
	const tokenizer = IntrinsicFunctionTokenizer.forText(expr);
	const call = tokenizer.consumeCall();
	if (!tokenizer.done) {
		throw intrinsicFailure(`Extra garbage after Intrinsic Function call: ${JSON.stringify(expr.substring(tokenizer.at))}`);
	}
	return call;
};

/**
 * Helper for generating a uniform error for Intrinsic Function call fails.
 */
const intrinsicFailure = (message: string) => new StatesError(STATES_INTRINSIC_FAILURE, message);

/**
 * Asserts that an arg value is a number.
 */
function intrinsicAssertNumber(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: number) => boolean): value is number {
	if (typeof value != "number" || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects a number for ${ argName }`);
	}
	return true;
}

/**
 * Asserts that an arg value is a JSONArray.
 */
function intrinsicAssertArray(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: JSONArray) => boolean): value is JSONArray {
	if (typeof value != "object" || !Array.isArray(value) || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects an array for ${ argName }`);
	}
	return true;
}

/**
 * Asserts that an arg value is a string.
 */
function intrinsicAssertString(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: string) => boolean): value is string {
	if (typeof value !== "string" || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects a string for ${ argName }`);
	}
	return true;
}

/**
 * Asserts that an arg value is a Boolean literal.
 */
function intrinsicAssertBoolean(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: boolean) => boolean): value is boolean {
	if (typeof value !== "boolean" || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects a Boolean for ${ argName }`);
	}
	return true;
}

/**
 * Asserts that an arg value is present.
 */
function intrinsicAssertDefined(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: JSONSerializable) => boolean): value is JSONSerializable {
	if (value === undefined || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects a value for ${ argName }`);
	}
	return true;
}

/**
 * Asserts that an arg value is a JSONObject.
 */
function intrinsicAssertObject(value: JSONSerializable | undefined, fnName: string, argName: string, predicate?: (v: JSONObject) => boolean): value is JSONObject {
	if (value == null || typeof value !== "object" || Array.isArray(value) || (predicate?.(value) === false)) {
		throw intrinsicFailure(`${ fnName } expects an object for ${ argName }`);
	}
	return true;
}

/**
 * Generic signature for a function which asserts a given arg value is
 * of the correct type for that param.
 */
type IntrinsicParamAsserter<T extends JSONSerializable> = (value: JSONSerializable | undefined, fnName: string, paramName: string, predicate?: (v: T) => boolean) => value is T;

/**
 * For the Intrinsic Function handler builder, a tuple which describes
 * the shape of a rest/spread parameter.
 */
type HandlerRestParam<T extends JSONSerializable> = [ paramName: string, asserter: IntrinsicParamAsserter<T>, rest: true ];
/**
 * For the Intrinsic Function handler builder, a tuple which describes
 * the shape of an optional parameter.
 */
type HandlerOptionalParam<T extends JSONSerializable> = [ paramName: string, asserter: IntrinsicParamAsserter<T>, rest: false, predicate: undefined | ((value: T) => boolean), optional: true ];
/**
 * A tuple which describes the shape of an Intrinsic Function call param.
 */
type HandlerParam<T extends JSONSerializable> =
	| [ paramName: string, asserter: IntrinsicParamAsserter<T> ]
	| HandlerRestParam<T>
	| [ paramName: string, asserter: IntrinsicParamAsserter<T>, rest: boolean, predicate: (value: T) => boolean ]
	| HandlerOptionalParam<T>
	;

function intrinsicHandler<R extends JSONSerializable>(name: string, params: [], handler: () => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable>(name: string, params: [ HandlerRestParam<T> ], handler: (...t: T[]) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable>(name: string, params: [ HandlerParam<T> ], handler: (t: T) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable, U extends JSONSerializable>(name: string, params: [ HandlerParam<T>, HandlerRestParam<U> ], handler: (t: T, ...u: U[]) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable, U extends JSONSerializable>(name: string, params: [ HandlerParam<T>, HandlerParam<U> ], handler: (t: T, u: U) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable, U extends JSONSerializable, V extends JSONSerializable>(name: string, params: [ HandlerParam<T>, HandlerParam<U>, HandlerOptionalParam<V> ], handler: (t: T, u: U, v?: V | undefined) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
function intrinsicHandler<R extends JSONSerializable, T extends JSONSerializable, U extends JSONSerializable, V extends JSONSerializable>(name: string, params: [ HandlerParam<T>, HandlerParam<U>, HandlerParam<V> ], handler: (t: T, u: U, v: V) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable;
/**
 * Build a shim which validates the args passed into an Intrinsic Function
 * call, so the actual logic can use the validated types without as much
 * visual noise.  Also helps produce more uniform and informative errors.
 */
function intrinsicHandler<R extends JSONSerializable>(name: string, params: HandlerParam<JSONSerializable>[], handler: (...args: JSONSerializable[]) => R): (...args: (JSONSerializable | undefined)[]) => JSONSerializable {
	const paramNames = params.map((p) => p[ 0 ]);
	const fnName = name.concat("(", paramNames.join(","), ")");
	return function checkIntrinsicParams(...args: (JSONSerializable | undefined)[]): R {
		let expectedCount = 0;
		let validated: JSONSerializable[] = [];
		for (let i = 0; i < params.length; i++) {
			const [ paramName, asserter, rest, predicate, optional ] = params[ i ]!;
			if (rest === true) {
				expectedCount = args.length;
				args.slice(i).filter((arg) => asserter(arg, fnName, paramName, predicate)).forEach((arg) => validated.push(arg));
				break;
			} else if (optional === true) {
				const arg = args[ i ];
				if (arg !== undefined) {
					asserter(arg, fnName, paramName, predicate);
					expectedCount++;
				}
				validated.push(arg as JSONSerializable);
			} else {
				expectedCount++;
				const arg = args[ i ];
				if (asserter(arg, fnName, paramName, predicate)) {
					validated.push(arg);
				}
			}
		}
		if (args.length !== expectedCount) {
			throw intrinsicFailure(`${ fnName } expected ${ expectedCount } argument(s), got ${ args.length }`);
		}
		return handler(...validated);
	};
}

export const statesFormat = (text: string, ...values: JSONSerializable[]): string => {
	let result = text;
	for (const arg of values) {
		const s = String(arg);
		result = result.replace("{}", s);
	}
	return result;
};

export const statesStringToJson = (text: string): JSONSerializable => {
	try {
		return JSON.parse(text) as JSONSerializable;
	} catch (err: unknown) {
		throw intrinsicFailure(`${ STATES_STRING_TO_JSON } JSON parsing failed`);
	}
};

export const statesJsonToString = (value: JSONSerializable): string => {
	return JSON.stringify(value);
};

export const statesArray = (...values: JSONSerializable[]): JSONArray => {
	return values;
};

export const statesArrayPartition = (array: JSONArray, size: number): JSONArray => {
	return toBatches(size, array, FILL_BATCHES);
};

export const statesArrayContains = (haystack: JSONArray, needle: JSONSerializable): boolean => {
	return haystack.some((value) => deepEquals(value, needle));
};

export const statesArrayRange = (first: number, last: number, step: number): number[] => {
	const count = Math.trunc(Math.abs((last - first) / step));
	if (count > 1000) {
		throw intrinsicFailure(`${ STATES_ARRAY_RANGE }(${ first },${ last },${ step }) would produce ${ count } items, when 1000 is the maximum`);
	}
	return Array.from(intRange.from(first).by(step).toInclusive(last));
};

export const statesArrayGetItem = (array: JSONArray, index: number): JSONSerializable => {
	return array.at(index) ?? null;
};

export const statesArrayLength = (array: JSONArray): number => {
	return array.length;
};

export const statesArrayUnique = (array: JSONArray): JSONArray => {
	return arrayUnique(array);
};

export const statesBase64Encode = (text: string): string => {
	if (text.length > 10_000) {
		throw intrinsicFailure(`${ STATES_BASE64_ENCODE }(text) accepts strings up to 10_000 characters, found ${ text.length }`);
	}
	return Buffer.from(text).toString("base64");
};

export const statesBase64Decode = (encoded: string): string => {
	if (encoded.length > 10_000) {
		throw intrinsicFailure(`${ STATES_BASE64_ENCODE }(encoded) accepts strings up to 10_000 characters, found ${ encoded.length }`);
	}
	return Buffer.from(encoded, "base64").toString();
};

export const statesHash = (data: JSONSerializable, algorithm: string): string => {
	const text = typeof data === "string" ? data : JSON.stringify(data);
	if (text.length > 10_000) {
		throw intrinsicFailure(`${ STATES_HASH }(data,algorithm) accepts the stringified value of data up to 10_000 characters, found ${ text.length }`);
	}
	try {
		return createHash(algorithm).update(text).digest("hex");
	} catch (_err: unknown) {
		throw intrinsicFailure(`${ STATES_HASH } failed to hash`);
	}
};

export const statesJsonMerge = (left: JSONObject, right: JSONObject, deep: boolean): JSONObject => {
	if (!deep) {
		return { ...left, ...right };
	}
	return deepMerge(left, right);
};

export const statesMathRandom = (start: number, end: number, seed?: number): number => {
	const rng = randomNumberGenerator({ seed });
	return rng.range(start, end);
};

export const statesMathAdd = (a: number, b: number): number => {
	return a + b;
};

export const statesStringSplit = (text: string, delimiter: string): string[] => {
	return text.split(delimiter);
};

export const statesUUID = (): string => {
	return randomUUID();
};

/**
 * Dispatch table for all known Intrinsic Functions.
 */
const knownIntrinsicFunctions: Record<string, (...args: (JSONSerializable | undefined)[]) => JSONSerializable> = {
	[ STATES_FORMAT ]: intrinsicHandler(STATES_FORMAT, [
		[ "text", intrinsicAssertString ],
		[ "values", intrinsicAssertDefined, true ],
	], statesFormat),
	[ STATES_STRING_TO_JSON ]: intrinsicHandler(STATES_STRING_TO_JSON, [
		[ "text", intrinsicAssertString ],
	], statesStringToJson),
	[ STATES_JSON_TO_STRING ]: intrinsicHandler(STATES_JSON_TO_STRING, [
		[ "value", intrinsicAssertDefined ],
	], statesJsonToString),
	[ STATES_ARRAY ]: intrinsicHandler(STATES_ARRAY, [
		[ "values", intrinsicAssertDefined, true ],
	], statesArray),
	[ STATES_ARRAY_PARTITION ]: intrinsicHandler(STATES_ARRAY_PARTITION, [
		[ "array", intrinsicAssertArray ],
		[ "size", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) && v > 0 ],
	], statesArrayPartition),
	[ STATES_ARRAY_CONTAINS ]: intrinsicHandler(STATES_ARRAY_CONTAINS, [
		[ "haystack", intrinsicAssertArray ],
		[ "needle", intrinsicAssertDefined ],
	], statesArrayContains),
	[ STATES_ARRAY_RANGE ]: intrinsicHandler(STATES_ARRAY_RANGE, [
		[ "first", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
		[ "last", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
		[ "step", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) && v !== 0 ],
	], statesArrayRange),
	[ STATES_ARRAY_GET_ITEM ]: intrinsicHandler(STATES_ARRAY_GET_ITEM, [
		[ "array", intrinsicAssertArray ],
		[ "index", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
	], statesArrayGetItem),
	[ STATES_ARRAY_LENGTH ]: intrinsicHandler(STATES_ARRAY_LENGTH, [
		[ "array", intrinsicAssertArray ],
	], statesArrayLength),
	[ STATES_ARRAY_UNIQUE ]: intrinsicHandler(STATES_ARRAY_UNIQUE, [
		[ "array", intrinsicAssertArray ],
	], statesArrayUnique),
	[ STATES_BASE64_ENCODE ]: intrinsicHandler(STATES_BASE64_ENCODE, [
		[ "text", intrinsicAssertString ],
	], statesBase64Encode),
	[ STATES_BASE64_DECODE ]: intrinsicHandler(STATES_BASE64_DECODE, [
		[ "encoded", intrinsicAssertString ],
	], statesBase64Decode),
	[ STATES_HASH ]: intrinsicHandler(STATES_HASH, [
		[ "data", intrinsicAssertDefined ],
		[ "algorithm", intrinsicAssertString, false, (v) => STATES_HASH_ALGORITHMS.includes(v as StatesHashAlgorithm) ],
	], statesHash),
	[ STATES_JSON_MERGE ]: intrinsicHandler(STATES_JSON_MERGE, [
		[ "left", intrinsicAssertObject ],
		[ "right", intrinsicAssertObject ],
		[ "deep", intrinsicAssertBoolean ],
	], statesJsonMerge),
	[ STATES_MATH_RANDOM ]: intrinsicHandler(STATES_MATH_RANDOM, [
		[ "start", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
		[ "end", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
		[ "seed", intrinsicAssertNumber, false, undefined, true ],
	], statesMathRandom),
	[ STATES_MATH_ADD ]: intrinsicHandler(STATES_MATH_ADD, [
		[ "a", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
		[ "b", intrinsicAssertNumber, false, (v) => Number.isSafeInteger(v) ],
	], statesMathAdd),
	[ STATES_STRING_SPLIT ]: intrinsicHandler(STATES_STRING_SPLIT, [
		[ "text", intrinsicAssertString ],
		[ "delimiter", intrinsicAssertString ],
	], statesStringSplit),
	[ STATES_UUID ]: intrinsicHandler(STATES_UUID, [], statesUUID),
};

/**
 * General entry point for an Intrinsic Function.
 * Given an Intrinsic Function call expression, parse it, validate
 * the given args against the params, and evaluate and return the result.
 */
export const evaluateIntrinsicFunction = (
	expr: string | IntrinsicFunctionCall,
	input: JSONSerializable = {},
	context?: JSONSerializable | undefined,
): JSONSerializable => {
	let call: IntrinsicFunctionCall;
	if (typeof expr === "string") {
		call = parseIntrinsicFunctionExpression(expr);
	} else {
		call = expr;
	}
	const args = call.args.map((arg) => {
		if (arg.type === "literal") {
			return arg.value;
		}
		if (arg.type === "path") {
			const path = arg.value;
			let result: unknown;
			if (path.startsWith("$$")) {
				result = jsonpath.query(context, path.substring(1));
			} else if (path.startsWith("$")) {
				result = jsonpath.query(input, path);
			}
			if (Array.isArray(result) && result.length === 1) {
				result = result[ 0 ];
			}
			assertJSONSerializable(result);
			return result;
		}
		return evaluateIntrinsicFunction(arg, input, context);
	});
	const handler = knownIntrinsicFunctions[ call.fnName ];
	if (handler == null) {
		throw new ReferenceError(`Unknown intrinsic function: ${ call.fnName }`);
	}
	return handler(...args);
};
