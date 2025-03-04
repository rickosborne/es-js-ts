import { isDigit } from "@rickosborne/guard";
import { singleCharactersOf, type StringIterable } from "./single-characters-of.js";
import { isSvgPathCommand, type SvgPathCommand, type SvgPathToken, type SvgPathValue } from "./svg-path-tokens.js";

const VALUE_STATE_ANY = 0;
const VALUE_STATE_NUMBER = 1;
const VALUE_STATE_SPACE = 2;
const VALUE_STATE_LITERAL = 3;

type ValueState = typeof VALUE_STATE_ANY | typeof VALUE_STATE_NUMBER | typeof VALUE_STATE_SPACE | typeof VALUE_STATE_LITERAL;

/**
 * Tokenize an SVG `path` definition into `command`, `number`, and `space` tokens.
 */
export function* svgPathValuesOf(...d: StringIterable[]): Generator<SvgPathValue, void, undefined> {
	let state: ValueState = VALUE_STATE_ANY;
	let at = -1;
	let chars: string[] = [];
	let isFloat = false;
	let hasExponent = false;
	let hasExponentSign = false;
	for (const char of singleCharactersOf(...d)) {
		at++;
		if (state === VALUE_STATE_NUMBER) {
			if (isDigit(char)) {
				chars.push(char);
				continue;
			}
			if (char === ".") {
				if (isFloat || hasExponent) {
					throw new Error(`Invalid float value at ${ at }`);
				}
				isFloat = true;
				chars.push(char);
				continue;
			}
			if (char === "e" || char === "E") {
				if (hasExponent) {
					throw new Error(`Invalid float with exponent at ${ at }`);
				}
				hasExponent = true;
				chars.push(char);
				continue;
			}
			if (char === "-" || char === "+") {
				if (!hasExponent || hasExponentSign) {
					throw new Error(`Invalid float at ${ at }`);
				}
				hasExponentSign = true;
				chars.push(char);
				continue;
			}
			// Terminate the number
			let value: number;
			const text = chars.join("");
			if (isFloat || hasExponent) {
				value = Number.parseFloat(text);
			} else {
				value = Number.parseInt(text);
			}
			yield { type: "number", at: at - chars.length, length: chars.length, value };
			chars.splice(0, chars.length);
			isFloat = false;
			hasExponent = false;
			hasExponentSign = false;
			state = VALUE_STATE_ANY;
		}
		if (state === VALUE_STATE_SPACE) {
			if (char === "," || /^\s$/.test(char)) {
				chars.push(char);
				continue;
			}
			yield { type: "space", at: at - chars.length, length: chars.length, value: chars.join("") };
			chars.splice(0, chars.length);
			state = VALUE_STATE_ANY;
		}
		if (isDigit(char) || char === "-" || char === "+") {
			chars.push(char);
			state = VALUE_STATE_NUMBER;
			continue;
		}
		if (char === "," || /^\s$/.test(char)) {
			chars.push(char);
			state = VALUE_STATE_SPACE;
			continue;
		}
		if (isSvgPathCommand(char)) {
			yield { type: "command", length: 1, at, value: char };
			continue;
		}
		if (char !== "") {
			throw new Error(`Unknown text at ${ at }: ${ JSON.stringify(char) }`);
		}
	}
}

/**
 * Parse an SVG `path` definition into drawing commands.
 */
export function* svgPathCommandsOf(...d: StringIterable[]): Generator<SvgPathToken, void, undefined> {
	let state: SvgPathCommand | "" = "";
	let numbers: number[] = [];
	let lastToken: SvgPathToken | undefined = undefined;
	for (const { type, at, value } of svgPathValuesOf(...d, "")) {
		if (type === "space") {
			continue;
		}
		if (state === "") {
			if (type === "command") {
				if (value === "z" || value === "Z") {
					lastToken = { type: "close" };
					yield lastToken;
					state = "";
					continue;
				}
				state = value;
				numbers = [];
				continue;
			}
			throw new Error(`Expected a command at ${ at }, found ${ type }`);
		}
		if (type === "command") {
			throw new Error(`Incomplete ${ state } at ${ at }, found command ${ value }`);
		}
		numbers.push(value);
		switch (state) {
			case "A":
			case "a": {
				if (numbers.length < 7) {
					break;
				}
				const [ rx, ry, xar, largeFlag, sweepFlag, x, y ] = numbers.splice(0, 7) as [ number, number, number, number, number, number, number ];
				const delta = state === "a";
				const large = largeFlag !== 0;
				const sweep = sweepFlag !== 0;
				lastToken = { type: "arc", delta, large, sweep, rx, ry, xar, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "C":
			case "c": {
				if (numbers.length < 6) {
					break;
				}
				const [ x1, y1, x2, y2, x, y ] = numbers.splice(0, 6) as [ number, number, number, number, number, number ];
				const delta = state === "c";
				lastToken = { type: "cubic", delta, x1, y1, x2, y2, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "H":
			case "h": {
				const [ x ] = numbers.splice(0, 1) as [ number ];
				const delta = state === "h";
				lastToken = { type: "line", delta, x, y: 0 };
				yield lastToken;
				state = "";
				break;
			}
			case "V":
			case "v": {
				const [ y ] = numbers.splice(0, 1) as [ number ];
				const delta = state === "v";
				lastToken = { type: "line", delta, x: 0, y };
				yield lastToken;
				state = "";
				break;
			}
			case "M":
			case "m": {
				if (numbers.length < 2) {
					break;
				}
				const [ x, y ] = numbers.splice(0, 2) as [ number, number ];
				const delta = state === "m";
				lastToken = { type: "move", delta, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "L":
			case "l": {
				if (numbers.length < 2) {
					break;
				}
				const [ x, y ] = numbers.splice(0, 2) as [ number, number ];
				const delta = state === "l";
				lastToken = { type: "line", delta, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "Q":
			case "q": {
				if (numbers.length < 4) {
					break;
				}
				const [ x1, y1, x, y ] = numbers.splice(0, 4) as [ number, number, number, number ];
				const delta = state === "q";
				lastToken = { type: "quad", delta, x1, y1, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "S":
			case "s": {
				if (numbers.length < 4) {
					break;
				}
				if (lastToken == null || lastToken.type !== "cubic") {
					throw new Error(`Expected ${ state } command to follow C/c, but found ${ lastToken?.type ?? "none" }`);
				}
				const dx = lastToken.x - lastToken.x2;
				const dy = lastToken.y - lastToken.y2;
				const x1: number = lastToken.x + dx;
				const y1: number = lastToken.y + dy;
				const [ x2, y2, x, y ] = numbers.splice(0, 4) as [ number, number, number, number ];
				const delta = state === "s";
				lastToken = { type: "cubic", delta, x1, y1, x2, y2, x, y };
				yield lastToken;
				state = "";
				break;
			}
			case "T":
			case "t": {
				if (numbers.length < 2) {
					break;
				}
				if (lastToken == null || lastToken.type !== "quad") {
					throw new Error(`Expected ${ state } command to follow Q/q, but found ${ lastToken?.type ?? "none" }`);
				}
				const dx = lastToken.x - lastToken.x1;
				const dy = lastToken.y - lastToken.y1;
				const x1: number = lastToken.x + dx;
				const y1: number = lastToken.y + dy;
				const [ x, y ] = numbers.splice(0, 2) as [ number, number ];
				const delta = state === "t";
				lastToken = { type: "quad", delta, x1, y1, x, y };
				yield lastToken;
				state = "";
				break;
			}
			default: {
				throw new Error(`Unknown command: ${ state as string }`);
			}
		}
	}
}
