import { type CSSColorName, toCSSColorName } from "./colors.js";
import type { CSSErrorOptions } from "./css-error.js";
import { CSSError } from "./css-error.js";
import { HREF_COLOR, HREF_COLOR_FN } from "./href.js";
import { readFromCSS } from "./tokenizer.js";
import type { DimensionPair } from "./units.js";

export interface HexColorToken {
	components?: never;
	functionName?: never;
	hex: string;
	name?: never;
	space?: never;
}

export interface NameColorToken {
	components?: never;
	functionName?: never;
	hex?: never;
	name: CSSColorName;
	space?: never;
}

export interface FunctionColorToken {
	components: DimensionPair[];
	functionName: string;
	hex?: never;
	name?: never;
	space?: string | undefined;
}

export type CSSColorTokens = NameColorToken | HexColorToken | FunctionColorToken;

export type CSSColorFunction = "color" | "rgb" | "rgba" | "hsl" | "hsla" | "hwb";
export const COLOR_FUNCTIONS: Readonly<CSSColorFunction[]> = Object.freeze([ "color", "rgb", "rgba", "hsl", "hsla", "hwb" ]);

export const colorTokensFromCSS = (
	text: string,
): CSSColorTokens | undefined => {
	if (text.trim() === "") {
		return undefined;
	}
	const reader = readFromCSS(text);
	const kwOrFn = reader.pull(
		"hex",
		{
			match: COLOR_FUNCTIONS,
			type: "function",
		},
		"keyword",
	);
	if (kwOrFn == null) return undefined;
	if (kwOrFn.type === "keyword") {
		const keyword = kwOrFn.keyword;
		const name = toCSSColorName(keyword);
		if (name == null) {
			throw new CSSError(text, { expected: "Color name", href: HREF_COLOR, message: `Unknown keyword: ${ keyword }` });
		}
		return { name };
	}
	if (kwOrFn.type === "hex") {
		return { hex: kwOrFn.hex };
	}
	const functionName = kwOrFn.name;
	let space: string | undefined = undefined;
	const fail = (message: string, options: Partial<CSSErrorOptions> = {}): never => {
		throw new CSSError(text, { ...options, message });
	};
	if (kwOrFn.name === "color") {
		const spaceKw = reader.pull({
			type: "keyword",
		});
		if (spaceKw == null) {
			return fail(`Missing color space`, { href: HREF_COLOR_FN });
		}
		space = spaceKw.keyword;
	}
	let functionDone = false;
	const components: DimensionPair[] = [];
	const breakAfterNumber = (): boolean => {
		if (components.length === 3) {
			// Try to consume a comma or slash
			reader.pull({ match: [ ",", "/" ], type: "literal" });
		} else {
			// Try to consume a comma
			reader.pull({ match: [ "," ], type: "literal" });
		}
		if (components.length >= 3) {
			const paren = reader.pull({ match: [ ")" ], type: "literal" });
			if (paren != null) {
				functionDone = true;
				return true;
			}
		}
		return false;
	};
	while (!functionDone) {
		if (components.length >= 4) {
			return fail(`Malformed ${ functionName }() color`);
		}
		const token = reader.pull(
			"number",
			{ match: [ "none" ], type: "keyword" },
		);
		if (token == null) {
			return fail(`Malformed ${ functionName }() color`);
		}
		if (token.type === "keyword") {
			if (token.keyword === "none") {
				components.push([ 0, undefined ]);
				if (breakAfterNumber()) {
					break;
				}
				continue;
			}
			// return fail(`Unknown keyword: ${ token.keyword }`);
		}
		if (token.type === "number") {
			const unitToken = reader.pull(
				"keyword",
				{ match: [ "%" ], type: "literal" },
			);
			let unit: string | undefined;
			if (unitToken?.type === "literal") {
				unit = unitToken.literal;
			} else if (unitToken?.type === "keyword") {
				unit = unitToken.keyword;
			} else {
				unit = undefined;
			}
			components.push([ token.value, unit ]);
			if (breakAfterNumber()) {
				break;
			}
			// continue;
		}
		// return fail(`Unexpected token type: ${ token.type }`);
	}
	return {
		components,
		functionName,
		...(space == null ? {} : { space }),
	};
};
