import { ANGLE_CONVERSIONS, colorTokensFromCSS, convertBetweenUnits, type CSSAngleUnit, type DimensionPair, hexFromCSSName, isAngleUnit } from "@rickosborne/css";
import { ColorConversionError } from "./color-conversion-error.js";
import { Color } from "./color.js";
import { type Float01, type Int255, type Int360, toFloat01, toInt255, toInt360 } from "./numbers.js";

const to01 = ([ value, unit ]: DimensionPair): Float01 | undefined => {
	if (unit === "%") {
		return toFloat01(value * 0.01);
	}
	return toFloat01(value);
};

const to255 = ([ value, unit ]: DimensionPair): Int255 | undefined => {
	if (unit == null) {
		return toInt255(value);
	}
	if (unit === "%") {
		return toInt255(Math.round(value * 2.55));
	}
	throw new ColorConversionError("CSS color value", unit, { message: `Unknown color value unit: ${ unit }` });
};

const to360 = ([ value, unit = "deg" ]: DimensionPair): Int360 | undefined => {
	if (!isAngleUnit(unit)) {
		throw new ColorConversionError("CSS color angle", unit, { message: `Unknown CSS color angle unit: ${ unit }` });
	}
	return convertBetweenUnits<CSSAngleUnit, Int360>(value, unit, "deg", ANGLE_CONVERSIONS, (n) => toInt360(Math.round(n)));
};

/**
 * Try to parse a CSS color expression.
 */
export const colorFromCSS = (text: string): Color | undefined => {
	const tokens = colorTokensFromCSS(text);
	if (tokens == null) {
		return undefined;
	}
	const { components, functionName, hex, name, space } = tokens;
	if (hex != null) {
		return Color.fromHexRGB(hex);
	}
	if (name != null) {
		const nameHex = hexFromCSSName(name);
		if (nameHex != null) {
			return Color.fromHexRGB(nameHex);
		}
		throw new ColorConversionError("CSS color name", text, { message: "Unknown color name" });
	}
	if (components == null) {
		throw new ColorConversionError("CSS color values", text, { message: "Missing color values" });
	}
	switch (functionName) {
		case "color": {
			if (space == null) {
				throw new ColorConversionError("CSS color space", text, { message: "Missing color space" });
			}
			switch (space) {
				case "sRGB": {
					const [ r, g, b, a ] = components.map(to01).map((n01) => n01 == null ? undefined : toInt255(Math.round(n01 * 255)));
					if (r == null || g == null || b == null) {
						throw new ColorConversionError("CSS sRGB color", text, { message: "Missing sRGB color values" });
					}
					return Color.fromRGB({ r, g, b, a });
				}
				default: {
					throw new ColorConversionError("CSS color space", text, { message: `Unknown color space: ${ space }` });
				}
			}
		}
		case "rgb":
		case "rgba": {
			if (components.length === 4) {
				const [ alphaValue, alphaUnit ] = components[ 3 ]!;
				if (alphaValue <= 1 && alphaUnit == null) {
					components[ 3 ]![ 0 ] = Math.round(alphaValue * 255);
				}
			} else if (components.length !== 3) {
				throw new ColorConversionError("CSS RGB Color", text, { message: "Expected 3 or 4 RGB color values" });
			}
			const [ r, g, b, a ] = components.map(to255);
			if (r == null || g == null || b == null) {
				throw new ColorConversionError("CSS RGB color", text, { message: "Missing sRGB color values" });
			}
			return Color.fromRGB({ r, g, b, a });
		}
		case "hsl":
		case "hsla": {
			if (components.length < 3 || components.length > 4) {
				throw new ColorConversionError("CSS HSL color", text, { message: "Expected 3 or 4 HSL color values" });
			}
			const h = to360(components.shift()!);
			const [ s, l, a ] = components.map(to01);
			if (h == null || s == null || l == null) {
				throw new ColorConversionError("CSS HSL color", text, { message: "Missing HSL color values" });
			}
			return Color.fromHSL({ h, s, l, a });
		}
		case "hwb": {
			if (components.length < 3 || components.length > 4) {
				throw new ColorConversionError("CSS HSV/HWB color", text, { message: "Expected 3 or 4 HSV/HWB color values" });
			}
			const h = to360(components.shift()!);
			const [ s, v, a ] = components.map(to01);
			if (h == null || s == null || v == null) {
				throw new ColorConversionError("CSS HSV/HWB color", text, { message: "Missing HSV/HWB color values" });
			}
			return Color.fromHSV({ h, s, v, a });
		}
		default: {
			throw new ColorConversionError("CSS color function", text, { message: "Unknown color function" });
		}
	}
};
