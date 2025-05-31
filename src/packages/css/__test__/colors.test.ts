import { entriesOf } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, it, test } from "mocha";
import { cssNameFromHex, HEX_FROM_NAME, hexFromCSSName, isColorName, isCSSColorName, isTransparentHex, RENAMED_COLORS, toCSSColorName } from "../colors.js";

describe("colors", () => {
	it("the known colors are formatted", () => {
		for (const [ name, hex ] of Object.entries(HEX_FROM_NAME)) {
			expect(name, "name").match(/^\w+$/);
			expect(hex, "hex").match(/^#[A-F0-9]{6,8}$/);
		}
	});

	test(hexFromCSSName.name, () => {
		for (const [ name, hex ] of Object.entries(HEX_FROM_NAME)) {
			expect(hexFromCSSName(name)).eq(hex);
			expect(hexFromCSSName(name.toLowerCase())).eq(hex);
			expect(hexFromCSSName(name.toUpperCase())).eq(hex);
		}
		expect(hexFromCSSName("garbage")).eq(undefined);
		expect(hexFromCSSName(undefined)).eq(undefined);
	});

	test(cssNameFromHex.name, () => {
		for (const [ name, hex ] of entriesOf(HEX_FROM_NAME).filter(([ , h ]) => h.length === 7)) {
			const expected = RENAMED_COLORS[ name ] ?? name;
			expect(cssNameFromHex(hex)).eq(expected);
			expect(cssNameFromHex(hex.toLowerCase())).eq(expected);
			expect(cssNameFromHex(hex.concat("12"))).eq(expected);
			expect(cssNameFromHex(hex.concat("00"))).eq("transparent");
		}
		expect(cssNameFromHex(undefined)).eq(undefined);
		expect(cssNameFromHex("#123456")).eq(undefined);
		expect(cssNameFromHex("#123")).eq(undefined);
		expect(cssNameFromHex("#1230")).eq("transparent");
		expect(cssNameFromHex("#12345600")).eq("transparent");
	});

	test(isTransparentHex.name, () => {
		expect(isTransparentHex("#123456"), "#123456").eq(false);
		expect(isTransparentHex("#123"), "#123").eq(false);
		expect(isTransparentHex("#1230"), "#1230").eq(true);
		expect(isTransparentHex("#12345600"), "#12345600").eq(true);
	});

	test(toCSSColorName.name, () => {
		for (const name of Object.keys(HEX_FROM_NAME)) {
			expect(toCSSColorName(name)).eq(name);
			expect(toCSSColorName(name.concat("!")), `${ name }!`).eq(undefined);
			expect(toCSSColorName(name.toLowerCase()), `lower ${ name }`).eq(name);
			expect(toCSSColorName(name.toUpperCase()), `upper ${ name }`).eq(name);
		}
		expect(toCSSColorName(undefined)).eq(undefined);
	});

	test(isColorName.name, () => {
		for (const name of Object.keys(HEX_FROM_NAME)) {
			expect(isColorName(name), name).eq(true);
			expect(isColorName(name.toUpperCase()), name).eq(true);
			const lower = name.toLowerCase();
			expect(isColorName(lower), lower).eq(true);
		}
		expect(isColorName(undefined)).eq(false);
	});

	test(isCSSColorName.name, () => {
		for (const name of Object.keys(HEX_FROM_NAME)) {
			expect(isCSSColorName(name), name).eq(true);
			expect(isCSSColorName(name.toUpperCase()), name).eq(false);
			const lower = name.toLowerCase();
			expect(isCSSColorName(lower), lower).eq(name === lower);
		}
		expect(isCSSColorName(undefined)).eq(false);
	});
});
