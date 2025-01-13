import { cssFormatHex, cssNameFromHex } from "@rickosborne/css";
import { ColorConversionError } from "./color-conversion-error.js";
import { rgbFromHSL, rgbFromHSV } from "./color-conversion.js";
import { colorFromCSS } from "./color-from-css.js";
import { chroma01FromHSL, cssFormatHSL, type HSL } from "./hsl.js";
import { chroma01FromHSV, cssFormatHSV, type HSV } from "./hsv.js";
import { type Float01, float01FromInt255, type Int255, int255FromFloat01, type Int360 } from "./numbers.js";
import { chroma01FromRGB, cssFormatRGB, hue360FromRGB, parseHexRGB, type RGB } from "./rgb.js";

interface ColorConfig {
	alpha01?: Float01 | undefined;
	hex?: string | undefined;
	hsl?: HSL | undefined;
	hsv?: HSV | undefined;
	rgb?: RGB | undefined;
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
	protected _a01: Float01;
	protected _a255: Int255;
	protected _b255: Int255 | undefined;
	protected _c01: Float01 | undefined;
	protected _g255: Int255 | undefined;
	protected _h360: Int360 | undefined;
	protected _hex: string | undefined;
	protected _l01: Float01 | undefined;
	protected _name: string | null | undefined;
	protected _r255: Int255 | undefined;
	protected _sl01: Float01 | undefined;
	protected _sv01: Float01 | undefined;
	protected _v01: Float01 | undefined;

	protected constructor({ alpha01, hex, hsl, hsv, rgb }: ColorConfig) {
		this._a01 = alpha01 ?? hsl?.a ?? hsv?.a ?? float01FromInt255(rgb?.a) ?? (1 as Float01);
		this._a255 = rgb?.a ?? int255FromFloat01(this._a01);
		this._r255 = rgb?.r;
		this._g255 = rgb?.g;
		this._b255 = rgb?.b;
		this._h360 = hsl?.h ?? hsv?.h;
		this._sl01 = hsl?.s;
		this._sv01 = hsv?.s;
		this._l01 = hsl?.l;
		this._v01 = hsv?.v;
		this._hex = hex;
	}

	public get alpha01(): Float01 {
		return this._a01;
	}

	public get alpha255(): Int255 {
		return this._a255;
	}

	public get blue255(): Int255 {
		return this.rgb.b;
	}

	public get chroma01(): Float01 {
		if (this._c01 == null) {
			this._c01 = chroma01FromRGB(this.maybeRGB()) ?? chroma01FromHSL(this.maybeHSL()) ?? chroma01FromHSV(this.maybeHSV());
			if (this._c01 == null) {
				throw new ColorConversionError("chroma01", this, { message: "No RGB, Saturation, Value to find Chroma" });
			}
		}
		return this._c01;
	}

	public get css(): string {
		const name = this.cssName;
		if (name != null) {
			return name;
		}
		if (this.maybeRGB() != null) {
			return this.cssHex;
		}
		if (this.maybeHSV() != null) {
			return this.cssHWB;
		}
		if (this.maybeHSL() != null) {
			return this.cssHSL;
		}
		throw new ColorConversionError("CSS", this, { message: "Not enough color information" });
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

	public get cssName(): string | undefined {
		if (this._name === undefined) {
			this._name = cssNameFromHex(this.hex) ?? null;
		}
		if (this._name == null) {
			return undefined;
		}
		return this._name;
	}

	public get cssRGB(): string {
		return cssFormatRGB(this.rgb);
	}

	public get green255(): Int255 {
		return this.rgb.g;
	}

	public get hex(): string {
		if (this._hex == null) {
			const { a, b, g, r } = this.rgb;
			const parts = [ r, g, b ];
			if (a != null && a !== 255) {
				parts.push(a);
			}
			this._hex = "#".concat(parts.map((n) => {
				const h = n.toString(16);
				return h.length < 2 ? "0".concat(h) : h;
			}).join(""));
		}
		return this._hex;
	}

	public get hsl(): HSL {
		const a = this.alpha01;
		return {
			...(a == null ? {} : { a }),
			h: this.hue360,
			l: this.lum01,
			s: this.sl01,
		};
	}

	public get hsv(): HSV {
		const a = this.alpha01;
		return {
			...(a == null ? {} : { a }),
			h: this.hue360,
			s: this.sv01,
			v: this.val01,
		};
	}

	get hue360(): Int360 {
		if (this._h360 == null) {
			if (this._c01 === 0) {
				this._h360 = 0 as Int360;
			} else {
				const rgb = this.maybeRGB();
				if (rgb != null) {
					this._c01 ??= chroma01FromRGB(rgb);
					this._h360 = hue360FromRGB(rgb, this._c01);
				} else {
					throw new ColorConversionError("Hue", this, { message: "No Hue or RGB provided" });
				}
			}
		}
		return this._h360;
	}

	get lum01(): Float01 {
		this._l01 ??= (this.rgbMax01 + this.rgbMin01) / 2 as Float01;
		return this._l01;
	}

	public get red255(): Int255 {
		return this.rgb.r;
	}

	public get rgb(): RGB {
		const maybeRGB = this.maybeRGB();
		if (maybeRGB != null) {
			return maybeRGB;
		}
		const rgb = rgbFromHSL(this.maybeHSL()) ?? rgbFromHSV(this.maybeHSV());
		if (rgb == null) {
			throw new ColorConversionError("RGB", this, { message: "No Hue for RGB" });
		}
		this._r255 = rgb.r;
		this._g255 = rgb.g;
		this._b255 = rgb.b;
		return {
			a: this._a255,
			b: this._b255,
			g: this._g255,
			r: this._r255,
		};
	}

	get rgbMax01(): Float01 {
		if (this._r255 != null && this._g255 != null && this._b255 != null) {
			return Math.max(this._r255, this._g255, this._b255) / 255 as Float01;
		}
		throw new Error("No RGB for Value.");
	}

	get rgbMin01(): Float01 {
		if (this._r255 != null && this._g255 != null && this._b255 != null) {
			return Math.min(this._r255, this._g255, this._b255) / 255 as Float01;
		}
		throw new Error("No RGB for Value.");
	}

	get sl01() {
		if (this._sl01 == null) {
			const lum01 = this.lum01;
			this._sl01 = (lum01 === 0 || lum01 === 1 ? 0 : (this.chroma01 / (1 - Math.abs(2 * lum01 - 1)))) as Float01;
		}
		return this._sl01;
	}

	get sv01() {
		this._sv01 ??= (this.val01 === 0 ? 0 : (this.chroma01 / this.val01)) as Float01;
		return this._sv01;
	}

	get val01() {
		this._v01 ??= this.rgbMax01;
		return this._v01;
	}

	public static fromCSS(text: string): Color {
		const color = colorFromCSS(text);
		if (color == null) {
			throw new ColorConversionError("CSS", text, { message: "Unknown CSS color" });
		}
		return color;
	}

	public static fromHSL(hsl: HSL): Color {
		return new Color({ hsl });
	}

	public static fromHSV(hsv: HSV): Color {
		return new Color({ hsv });
	}

	public static fromHexRGB(text: string): Color {
		const rgb = parseHexRGB(text);
		const hex = cssFormatHex(text, "long");
		const alpha01 = float01FromInt255(rgb.a);
		return new Color({ alpha01, hex, rgb });
	}

	public static fromRGB(rgb: RGB): Color {
		return new Color({ rgb });
	}

	public equals(other: Color | undefined): boolean {
		if (this === other) {
			return true;
		}
		if (other == null) {
			return false;
		}
		if (this._a255 !== other._a255) {
			return false;
		}
		if (this._r255 != null) {
			return this._r255 === other.rgb.r
				&& this._g255 === other.rgb.g
				&& this._b255 === other.rgb.b;
		}
		if (this._h360 != null) {
			return (this._sl01 === other.hsl.s && this._l01 === other.hsl.l)
				|| (this._sv01 === other.hsv.s && this._v01 === other.hsv.v);
		}
		throw new ColorConversionError("equals", [ this, other ], { message: "Unable to compare colors" });
	}

	protected maybeHSL(): HSL | undefined {
		if (this._h360 != null && this._l01 != null && this._sl01 != null) {
			return { h: this._h360, s: this._sl01, l: this._l01, a: this._a01 };
		}
		return undefined;
	}

	protected maybeHSV(): HSV | undefined {
		if (this._h360 != null && this._v01 != null && this._sv01 != null) {
			return { h: this._h360, s: this._sv01, v: this._v01, a: this._a01 };
		}
		return undefined;
	}

	protected maybeRGB(): RGB | undefined {
		if (this._r255 != null && this._g255 != null && this._b255 != null) {
			return { r: this._r255, g: this._g255, b: this._b255, a: this._a255 };
		}
		return undefined;
	}

	public with(changes: ColorParts): Color {
		const alpha01 = changes.alpha01 ?? float01FromInt255(changes.alpha255) ?? this._a01;
		let r: Int255 | undefined = this._r255;
		let g: Int255 | undefined = this._g255;
		let b: Int255 | undefined = this._b255;
		let h: Int360 | undefined = this._h360;
		let sl: Float01 | undefined = this._sl01;
		let sv: Float01 | undefined = this._sv01;
		let l: Float01 | undefined = this._l01;
		let v: Float01 | undefined = this._v01;
		if (changes.red255 != null || changes.green255 != null || changes.blue255 != null) {
			r = changes.red255 ?? this.red255;
			g = changes.green255 ?? this.green255;
			b = changes.blue255 ?? this.blue255;
			h = undefined;
			sl = undefined;
			sv = undefined;
			l = undefined;
			v = undefined;
		} else if (changes.lum01 != null || changes.sl01 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			sv = undefined;
			v = undefined;
			h = changes.hue360 ?? this.hue360;
			l = changes.lum01 ?? this.lum01;
			sl = changes.sl01 ?? this.sl01;
		} else if (changes.sv01 != null || changes.val01 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			l = undefined;
			sl = undefined;
			h = changes.hue360 ?? this.hue360;
			sv = changes.sv01 ?? this.sv01;
			v = changes.val01 ?? this.sl01;
		} else if (changes.hue360 != null) {
			r = undefined;
			g = undefined;
			b = undefined;
			h = changes.hue360;
			sv = changes.sv01 ?? this.sv01;
			v = changes.val01 ?? this.val01;
			l = changes.lum01 ?? this.lum01;
			sl = changes.sl01 ?? this.sl01;
		}
		const rgb: RGB | undefined = r != null && g != null && b != null ? { r, g, b } : undefined;
		const hsl: HSL | undefined = h != null && sl != null && l != null ? { h, s: sl, l } : undefined;
		const hsv: HSV | undefined = h != null && sv != null && v != null ? { h, s: sv, v } : undefined;
		return new Color({
			alpha01,
			rgb,
			hsl,
			hsv,
		});
	}
}
