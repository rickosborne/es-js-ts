import { type CSSColorName, cssFormatHex, cssNameFromHex } from "@rickosborne/css";
import { config } from "chai";
import { ColorConversionError } from "./color-conversion-error.js";
import { hslFromHSV, hslFromRGB, hsvFromHSL, hsvFromRGB, rgbFromHSL, rgbFromHSV } from "./color-conversion.js";
import { colorFromCSS } from "./color-from-css.js";
import { chroma01FromHSL, cssFormatHSL, type HSL, type HSLA } from "./hsl.js";
import { chroma01FromHSV, cssFormatHSV, type HSV, type HSVA } from "./hsv.js";
import { type Float01, float01FromInt255, type Int255, int255FromFloat01, type Int360, toFloat01 } from "./numbers.js";
import { chroma01FromRGB, cssFormatRGB, hexFromRGB, type RGB, type RGBA, rgbFromHex } from "./rgb.js";

interface ColorConfig {
	alpha01: Float01;
	chroma01: Float01;
	hex: string;
	hsl: HSL;
	hsv: HSV;
	rgb: RGB;
}

export interface ColorParts {
	alpha01?: Float01 | undefined;
	alpha255?: Int255 | undefined;
	blue255?: Int255 | undefined;
	green255?: Int255 | undefined;
	hue360?: Int360 | undefined;
	lum01?: Float01 | undefined;
	red255?: Int255 | undefined;
	sl01?: Float01 | undefined;
	sv01?: Float01 | undefined;
	val01?: Float01 | undefined;
}

/**
 * Color parts which do not use branded numbers.  Useful for tests
 * or when you've already verified the values.
 */
export type UncheckedColorParts = {
	[K in keyof ColorParts]?: number | undefined;
}

export class Color implements ColorParts {
	public static fromCSS(text: string): Color {
		const color = colorFromCSS(text);
		if (color == null) {
			throw new ColorConversionError("CSS", text, { message: "Unknown CSS color" });
		}
		return color;
	}

	public static fromHSL(hsl: HSL): Color {
		const chroma01 = chroma01FromHSL(hsl);
		const rgb = rgbFromHSL(hsl);
		const hsv = hsvFromHSL(hsl);
		const alpha01 = toFloat01(hsl.a ?? 1);
		const hex = hexFromRGB(rgb, "long");
		return new Color({ alpha01, chroma01, hex, hsl, hsv, rgb });
	}

	public static fromHSV(hsv: HSV): Color {
		const chroma01 = chroma01FromHSV(hsv);
		const hsl = hslFromHSV(hsv);
		const rgb = rgbFromHSV(hsv);
		const alpha01 = toFloat01(hsv.a ?? 1);
		const hex = hexFromRGB(rgb, "long");
		return new Color({ alpha01, chroma01, hex, hsl, hsv, rgb });
	}

	public static fromHexRGB(text: string): Color {
		const rgb = rgbFromHex(text);
		return Color.fromRGB(rgb);
	}

	public static fromRGB(rgb: RGB): Color {
		const chroma01 = chroma01FromRGB(rgb);
		const hsl = hslFromRGB(rgb);
		const hsv = hsvFromRGB(rgb);
		const alpha01 = toFloat01((rgb.a ?? 255) / 255);
		const hex = hexFromRGB(rgb, "long");
		return new Color({ alpha01, chroma01, hex, hsl, hsv, rgb });
	}

	public readonly alpha01: Float01;
	public readonly alpha255: Int255;
	public readonly blue255: Int255;
	public readonly chroma01: Float01;
	public readonly green255: Int255;
	public readonly hex: string;
	public readonly hue360: Int360;
	public readonly lum01: Float01;
	public readonly name: CSSColorName | undefined;
	public readonly red255: Int255;
	public readonly sl01: Float01;
	public readonly sv01: Float01;
	public readonly val01: Float01;

	protected constructor(config: ColorConfig) {
		let { hsl, alpha01, chroma01, hex, hsv, rgb } = config;
		this.alpha01 = alpha01;
		this.alpha255 = rgb.a ?? int255FromFloat01(this.alpha01);
		this.red255 = rgb.r;
		this.green255 = rgb.g;
		this.blue255 = rgb.b;
		this.hue360 = hsl.h;
		this.sl01 = hsl.s;
		this.sv01 = hsv.s;
		this.lum01 = hsl.l;
		this.val01 = hsv.v;
		this.chroma01 = chroma01;
		this.hex = hex;
		this.name = cssNameFromHex(hex);
	}

	public get css(): string {
		return this.name ?? this.cssHex;
	}

	public get cssHSL(): string {
		return cssFormatHSL(this.hsl);
	}

	public get cssHWB(): string {
		return cssFormatHSV(this.hsv);
	}

	public get cssHex(): string {
		return cssFormatHex(this.hex);
	}

	public get cssRGB(): string {
		return cssFormatRGB(this.rgb);
	}

	public equals(other: Color | undefined): boolean {
		if (this === other) {
			return true;
		}
		if (other == null) {
			return false;
		}
		return this.hex === other.hex;
	}

	public get hsl(): HSLA {
		return {
			a: this.alpha01,
			h: this.hue360,
			l: this.lum01,
			s: this.sl01,
		};
	}

	public get hsv(): HSVA {
		return {
			a: this.alpha01,
			h: this.hue360,
			s: this.sv01,
			v: this.val01,
		};
	}

	public get rgb(): RGBA {
		return {
			a: this.alpha255,
			b: this.blue255,
			g: this.green255,
			r: this.red255,
		};
	}

	public with(changes: ColorParts): Color {
		const alpha01 = changes.alpha01 ?? float01FromInt255(changes.alpha255) ?? this.alpha01;
		let r: Int255 | undefined = this.red255;
		let g: Int255 | undefined = this.green255;
		let b: Int255 | undefined = this.blue255;
		let h: Int360 | undefined = this.hue360;
		let sl: Float01 | undefined = this.sl01;
		let sv: Float01 | undefined = this.sv01;
		let l: Float01 | undefined = this.lum01;
		let v: Float01 | undefined = this.val01;
		let chroma01: Float01;
		if (changes.red255 != null || changes.green255 != null || changes.blue255 != null) {
			r = changes.red255 ?? this.red255;
			g = changes.green255 ?? this.green255;
			b = changes.blue255 ?? this.blue255;
			h = undefined;
			sl = undefined;
			sv = undefined;
			l = undefined;
			v = undefined;
			chroma01 = chroma01FromRGB({ r, g, b });
		} else if (changes.lum01 != null || changes.sl01 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			sv = undefined;
			v = undefined;
			h = changes.hue360 ?? this.hue360;
			l = changes.lum01 ?? this.lum01;
			sl = changes.sl01 ?? this.sl01;
			chroma01 = chroma01FromHSL({ l, s: sl });
		} else if (changes.sv01 != null || changes.val01 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			l = undefined;
			sl = undefined;
			h = changes.hue360 ?? this.hue360;
			sv = changes.sv01 ?? this.sv01;
			v = changes.val01 ?? this.sl01;
			chroma01 = chroma01FromHSV({ v, s: sv });
		} else if (changes.hue360 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			h = changes.hue360;
			sv = changes.sv01 ?? this.sv01;
			v = changes.val01 ?? this.val01;
			l = changes.lum01 ?? this.lum01;
			sl = changes.sl01 ?? this.sl01;
			chroma01 = chroma01FromHSV({ v, s: sv });
		} else {
			chroma01 = this.chroma01;
		}
		let rgb: RGB | undefined = r != null && g != null && b != null ? { r, g, b } : undefined;
		let hsl: HSL | undefined = h != null && sl != null && l != null ? { h, s: sl, l } : undefined;
		let hsv: HSV | undefined = h != null && sv != null && v != null ? { h, s: sv, v } : undefined;
		hsl ??= hslFromHSV(hsv) ?? hslFromRGB(rgb);
		hsv ??= hsvFromHSL(hsl) ?? hsvFromRGB(rgb);
		rgb ??= rgbFromHSV(hsv) ?? rgbFromHSL(hsl);
		if (rgb == null || hsl == null || hsv == null) {
			throw new ColorConversionError("Unknown", config, { message: "Could not derive color" });
		}
		const hex = hexFromRGB(rgb, "long");
		return new Color({
			alpha01,
			chroma01,
			rgb,
			hex,
			hsl,
			hsv,
		});
	}
}
