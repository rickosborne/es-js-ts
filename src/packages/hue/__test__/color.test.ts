import { cssFormatPercent } from "@rickosborne/css";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ColorConversionError } from "../color-conversion-error.js";
import { Color, type UncheckedColorParts } from "../color.js";
import { toHSL } from "../hsl.js";
import { toHSV } from "../hsv.js";
import { type Float01, type Int255, type Int360, toFloat01 } from "../numbers.js";
import { toRGB } from "../rgb.js";
import { type CombinedParts, testColor } from "./test-color.fixture.js";
import { WIKI_COLORS } from "./wiki-colors.fixture.js";

const blueParts: UncheckedColorParts = {
	red255: 51,
	green255: 102,
	blue255: 153,
	sv01: 0.6667,
	val01: 0.60,
	lum01: 0.4,
	sl01: 0.5,
	hue360: 210,
	alpha01: 1,
	alpha255: 255,
};

const blueCombined = {
	rgb: toRGB(51, 102, 153, 255),
	hsl: toHSL(210, 0.5, 0.4, 1),
	hsv: toHSV(210, 0.6667, 0.6, 1),
	cssHSL: "hsl(210 50% 40%)",
	cssHWB: "hwb(210 66.7% 60%)",
	cssRGB: "rgb(51 102 153)",
} satisfies Partial<Color> & CombinedParts;

describe(Color.name, () => {
	it(Color.fromHexRGB.name, () => {
		testColor(Color.fromHexRGB("#369"), blueParts, blueCombined);
		testColor(Color.fromHexRGB("336699"), blueParts, blueCombined);
		testColor(Color.fromHexRGB("#336699cc"), {
			...blueParts,
			alpha255: 204,
			alpha01: 0.8,
		}, {
			rgb: { ...blueCombined.rgb, a: 204 as Int255 },
			hsl: { ...blueCombined.hsl, a: 0.8 as Float01 },
			hsv: { ...blueCombined.hsv, a: 0.8 as Float01 },
		});
		expect(() => Color.fromHexRGB("garbage")).throws(ColorConversionError);
	});
	it(Color.prototype.with.name, () => {
		const before = Color.fromHexRGB("#369");
		const ghosted = before.with({
			alpha01: 0.6 as Float01,
		});
		expect(ghosted).not.eq(before);
		testColor(ghosted, {
			...blueParts,
			alpha01: 0.6,
			alpha255: 153,
		}, {
			rgb: { ...blueCombined.rgb, a: 153 as Int255 },
			hsl: { ...blueCombined.hsl, a: 0.6 as Float01 },
			hsv: { ...blueCombined.hsv, a: 0.6 as Float01 },
			cssHSL: "hsl(210 50% 40% / 60%)",
			cssHWB: "hwb(210 66.7% 60% / 60%)",
			cssRGB: "rgb(51 102 153 / 60%)",
		});
		const angry = before.with({
			hue360: 120 as Int360,
		});
		testColor(angry, {
			red255: 51,
			green255: 153,
			blue255: 51,
			sv01: 0.6667,
			val01: 0.6,
			lum01: 0.4,
			sl01: 0.5,
			hue360: 120,
		});
		expect(angry.cssHex).eq("#393");
		const back = angry.with({
			red255: before.red255,
			green255: before.green255,
			blue255: before.blue255,
		});
		expect(back.equals(back), "back == back").eq(true);
		expect(before.equals(back), "before == back").eq(true);
		expect(back.equals(before), "back == before").eq(true);
		testColor(back, blueParts, blueCombined);
		const lightBlue = before.with({
			sl01: (1 + before.sl01) / 2 as Float01,
			lum01: (1 + before.lum01) / 2 as Float01,
		});
		testColor(lightBlue, {
			alpha01: 1,
			alpha255: 255,
			red255: 121,
			green255: 179,
			blue255: 236,
			hue360: blueParts.hue360,
			sv01: 0.4865,
			val01: 0.925,
			sl01: (1 + blueParts.sl01!) / 2,
			lum01: (1 + blueParts.lum01!) / 2,
		}, {
			rgb: toRGB(121, 179, 236),
			hsl: toHSL(before.hue360, (1 + blueParts.sl01!) / 2, (1 + blueParts.lum01!) / 2),
			hsv: toHSV(before.hue360, 0.4865, 0.925),
			cssHSL: "hsl(210 75% 70%)",
			cssHWB: "hwb(210 48.6% 92.5%)",
			cssRGB: "rgb(121 179 236)",
		});
		const alsoLightBlue = before.with({
			sv01: toFloat01((1 + blueParts.sv01!) / 2),
			val01: toFloat01((1 + blueParts.val01!) / 2),
		});
		testColor(alsoLightBlue, {
			...blueParts,
			hue360: blueParts.hue360,
			alpha01: 1,
			alpha255: 255,
			red255: 34,
			green255: 119,
			blue255: 204,
			sv01: toFloat01((1 + blueParts.sv01!) / 2),
			val01: toFloat01((1 + blueParts.val01!) / 2),
			sl01: 0.7143,
			lum01: 0.46667,
		}, {
			rgb: toRGB(34, 119, 204),
			hsl: toHSL(before.hue360, 0.7143, 0.46667),
			hsv: toHSV(before.hue360, (1 + blueParts.sv01!) / 2, (1 + blueParts.val01!) / 2),
			cssHSL: "hsl(210 71.4% 46.7%)",
			cssHWB: "hwb(210 83.3% 80%)",
			cssRGB: "rgb(34 119 204)",
		});
	});
	it(Color.prototype.equals.name, () => {
		expect(Color.fromHexRGB("#f00").equals(Color.fromCSS("hsl(0 100% 50%)"))).eq(true);
		expect(Color.fromCSS("hsl(0 100% 50%)").equals(Color.fromHexRGB("#f00"))).eq(true);
		expect(Color.fromHexRGB("#f00").equals(undefined)).eq(false);
		const red = Color.fromHexRGB("#f00");
		expect(red.equals(red)).eq(true);
		const overlayRed = Color.fromHexRGB("#ff000088");
		expect(red.equals(overlayRed)).eq(false);
	});
	it("black has chroma01 = 0", () => {
		const black = Color.fromHexRGB("000");
		testColor(black, {
			red255: 0,
			green255: 0,
			blue255: 0,
			hue360: 0,
			sv01: 0,
			sl01: 0,
			lum01: 0,
			val01: 0,
			alpha255: 255,
			alpha01: 1,
		});
	});

	describe("Wikipedia table", () => {
		it("converts from hex", () => {
			let index = 0;
			for (const{ hex, r01, g01, b01, h360, h2, c01, v01, l01, sv01, sl01 } of WIKI_COLORS) {
				let color: Color;
				let rgbTolerance: number;
				const method = index % 2;
				if (method === 1) {
					rgbTolerance = 1;
					const hueCSS = [
						`${ h360 ?? 0 }`,
						`${ h360 ?? 0 }deg`,
						`${ (h360 ?? 0) * Math.PI / 180 }rad`,
						`${ (h360 ?? 0) * 400 / 360 }grad`,
						`${ (h360 ?? 0) / 360 }turn`,
					][ index % 5 ]!;
					color = Color.fromCSS(`hsl(${ hueCSS } ${ cssFormatPercent(sl01, 0.0001) } ${ cssFormatPercent(l01, 0.0001) })`);
				} else {
					rgbTolerance = 0.5;
					color = Color.fromHexRGB(hex);
				}
				const { r: r255, g: g255, b: b255 } = color.rgb;
				expect(r255).closeTo(Math.round(r01 * 255), rgbTolerance, hex.concat(".r"));
				expect(g255).closeTo(Math.round(g01 * 255), rgbTolerance, hex.concat(".g"));
				expect(b255).closeTo(Math.round(b01 * 255), rgbTolerance, hex.concat(".b"));
				expect(color.hue360).closeTo(h360 ?? 0, 0.5, hex.concat(".h"));
				expect(color.hue360).closeTo(h2 ?? 0, 2, hex.concat(".h"));
				expect(color.chroma01).closeTo(c01, 0.005, hex.concat(".c"));
				expect(color.val01).closeTo(v01, 0.005, hex.concat(".v"));
				expect(color.lum01).closeTo(l01, 0.005, hex.concat(".l"));
				expect(color.sv01).closeTo(sv01, 0.005, hex.concat(".sv"));
				expect(color.sl01).closeTo(sl01, 0.01, hex.concat(".sl"));
				index++;
			}
		});

		it("shortens CSS colors", () => {
			expect(Color.fromHexRGB("#000000").css).eq("Black");
			expect(Color.fromHexRGB("#ffffff").css).eq("White");
			expect(Color.fromHexRGB("#003366").css).eq("#036");
			expect(Color.fromHexRGB("#012345").css).eq("#012345");
		});
	});
});
