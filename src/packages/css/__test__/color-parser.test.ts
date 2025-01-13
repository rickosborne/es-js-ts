import { expect } from "chai";
import { describe, test } from "mocha";
import { colorTokensFromCSS, type FunctionColorToken } from "../color-parser.js";
import { TRANSPARENT } from "../colors.js";
import { CSSError } from "../css-error.js";

describe(colorTokensFromCSS.name, () => {
	test("hex values", () => {
		expect(colorTokensFromCSS("#369")).eql({ hex: "#369" });
		expect(colorTokensFromCSS("#336699")).eql({ hex: "#336699" });
		expect(colorTokensFromCSS("#3")).eql({ hex: "#3" });
	});

	test("color names", () => {
		expect(colorTokensFromCSS("RebeccaPurple")).eql({ name: "RebeccaPurple" });
		expect(colorTokensFromCSS("rebeccapurple")).eql({ name: "RebeccaPurple" });
		expect(colorTokensFromCSS(TRANSPARENT)).eql({ name: TRANSPARENT });
		expect(colorTokensFromCSS(TRANSPARENT.toUpperCase())).eql({ name: TRANSPARENT });
		expect(() => colorTokensFromCSS("garbage")).throws(CSSError, "Unknown keyword: garbage");
	});

	describe("color functions", () => {
		test("color()", () => {
			expect(colorTokensFromCSS("color(sRGB 1 0 50%)")).eql({
				components: [
					[ 1, undefined ],
					[ 0, undefined ],
					[ 50, "%" ],
				],
				functionName: "color",
				space: "sRGB",
			} satisfies FunctionColorToken);
			expect(colorTokensFromCSS("color(sRGB 0.1 0 0 / 42%)")).eql({
				components: [
					[ 0.1, undefined ],
					[ 0, undefined ],
					[ 0, undefined ],
					[ 42, "%" ],
				],
				functionName: "color",
				space: "sRGB",
			} satisfies FunctionColorToken);
			expect(() => colorTokensFromCSS("color()")).throws(CSSError, "Missing color space");
		});
		test("named", () => {
			expect(colorTokensFromCSS("hsl(120deg 40% 50%)")).eql({
				components: [
					[ 120, "deg" ],
					[ 40, "%" ],
					[ 50, "%" ],
				],
				functionName: "hsl",
			} satisfies FunctionColorToken);
			expect(colorTokensFromCSS("rgba(32, none, 96, none)")).eql({
				components: [
					[ 32, undefined ],
					[ 0, undefined ],
					[ 96, undefined ],
					[ 0, undefined ],
				],
				functionName: "rgba",
			} satisfies FunctionColorToken);
			expect(() => colorTokensFromCSS("hwb()")).throws(CSSError, "Malformed hwb() color");
			expect(() => colorTokensFromCSS("rgb(5 ,".concat(", 7, 9)"))).throws(CSSError, "Malformed rgb() color");
			expect(() => colorTokensFromCSS("rgba(5 / 7, 9)")).throws(CSSError, "Malformed rgba() color");
			expect(() => colorTokensFromCSS("rgb(5, 7, 9 / 11 / 12)")).throws(CSSError, "Malformed rgb() color");
			expect(() => colorTokensFromCSS("rgb(5 7 9 11 12)")).throws(CSSError, "Malformed rgb() color");
		});
	});
});
