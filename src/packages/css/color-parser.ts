import { StringTokenizer } from "@rickosborne/foundation";
import { isDigit, isHexDigit } from "@rickosborne/guard";
import type { CSSColorName } from "./colors.js";
import { toCSSColorName } from "./colors.js";
import type { CSSErrorOptions } from "./css-error.js";
import { CSSError } from "./css-error.js";
import { HREF_COLOR, HREF_COLOR_FN } from "./href.js";
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

class CSSColorTokenizer extends StringTokenizer {
	public consumeColor(): CSSColorTokens | undefined {
		this.consumeSpace();
		const char = this.peek();
		if (char == null) {
			return undefined;
		}
		if (char === "#") {
			return this.consumeHex();
		}
		const literal = this.consumeLiteral();
		if (COLOR_FUNCTIONS.includes(literal as CSSColorFunction)) {
			return this.consumeFunctionCall(literal);
		}
		const name = toCSSColorName(literal);
		if (name == null) {
			throw this.fail(`Unknown keyword: ${ literal }`, { expected: "Color name", href: HREF_COLOR });
		}
		return { name };
	}

	public consumeFunctionCall(functionName: string): FunctionColorToken {
		this.consumeSpace();
		this.consumeExact("(");
		let space: string | undefined = undefined;
		if (functionName === "color") {
			space = this.consumeLiteral(() => this.fail("Missing color space", { href: HREF_COLOR_FN }));
		}
		const components: DimensionPair[] = [];
		const breakAfterComponent = (): boolean => {
			this.consumeSpace();
			if (components.length === 3) {
				// Try to consume a comma or slash
				if (!this.tryConsume(",")) {
					this.tryConsume("/");
				}
			} else {
				// Try to consume a comma
				this.tryConsume(",");
			}
			if (components.length >= 3) {
				if (this.tryConsume(")")) {
					return true;
				}
			}
			return false;
		};
		while (!this.done) {
			if (components.length >= 4) {
				throw this.fail(`Malformed ${ functionName }() color`);
			}
			this.consumeSpace();
			const component = this.tryConsumeColorComponent();
			if (component != null) {
				components.push(component);
				if (breakAfterComponent()) {
					break;
				}
			} else {
				throw this.fail(`Malformed ${ functionName }() color`);
			}
		}
		return {
			components,
			functionName,
			...(space == null ? {} : { space }),
		};
	}

	public consumeHex(): HexColorToken {
		return { hex: this.consumeWhile((t, i) => i === 0 ? t === "#" : isHexDigit(t)) };
	}

	public consumeLiteral(errorProvider: () => Error = () => new SyntaxError(`Expected a literal at ${ this.at }`)): string {
		const literal = this.tryConsumeLiteral();
		if (literal != null) {
			return literal;
		}
		throw errorProvider();
	}

	protected fail(message: string, options: Partial<CSSErrorOptions> = {}): CSSError {
		return new CSSError(this.text, { ...options, message });
	}

	protected tryConsumeColorComponent(): DimensionPair | undefined {
		if (this.tryConsume("none")) {
			return [ 0, undefined ];
		}
		const maybeNumber = this.tryConsumeNumber();
		if (maybeNumber == null) {
			return undefined;
		}
		this.consumeSpace();
		let unit: string | undefined;
		if (this.tryConsume("%")) {
			unit = "%";
		} else {
			unit = this.tryConsumeLiteral();
		}
		this.consumeSpace();
		return [ maybeNumber, unit ];
	}

	public tryConsumeLiteral(): string | undefined {
		const literal = this.consumeWhile((t, i) => i === 0 ? /^\p{ID_Start}$/u.test(t) : /^[-\p{ID_Continue}]$/u.test(t));
		return literal === "" ? undefined : literal;
	}

	public tryConsumeNumber(): number | undefined {
		const sign = this.tryConsume("-") ? -1 : 1;
		const intText = this.consumeWhile(isDigit);
		if (intText === "") {
			if (sign < 0) {
				throw this.fail(`Expected a number at ${ this.at }`);
			}
			return undefined;
		}
		if (this.tryConsume(".")) {
			const fracText = this.consumeWhile(isDigit);
			return sign * Number.parseFloat(`${ intText }.${ fracText }`);
		}
		return sign * Number.parseInt(intText, 10);
	}
}

export const colorTokensFromCSS = (
	text: string,
): CSSColorTokens | undefined => {
	return new CSSColorTokenizer(text).consumeColor();
};
