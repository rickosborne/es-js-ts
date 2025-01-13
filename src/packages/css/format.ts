import { imprecise } from "../foundation/imprecise.js";
import { RESOLUTION_BY_UNIT } from "./distance.js";

/**
 * Format a number and its optional units as a CSS dimension.
 * @see {@link https://www.w3.org/TR/css-values-4/#dimensions | CSS Level 4 Dimensions}
 */
export const cssFormatDimension = (value: number, units?: string | undefined, resolution?: number | undefined): string => {
	let res = resolution ?? (units == null ? undefined : RESOLUTION_BY_UNIT[ units ]);
	let text = imprecise(value, res);
	if (text === "0" || units == null) {
		return text;
	}
	return text.concat(units);
};

/**
 * Format a number as a CSS percentage.
 */
export const cssFormatPercent = (value: number | undefined, resolution?: number | undefined): string => {
	if (value == null) {
		return "";
	}
	if (value === 0) {
		return "0";
	}
	const v = value <= 1 ? value * 100 : value;
	return cssFormatDimension(v, "%", resolution);
};

/**
 * Format a CSS alpha in the range [0,1] value to an optional resolution.
 */
export const cssFormatAlpha01 = (alpha: number | undefined, resolution?: number | undefined): string => {
	if (alpha == null || alpha === 1) {
		return "";
	}
	return " / ".concat(cssFormatPercent(alpha, resolution));
};

/**
 * Format a CSS color hex, with optional short or long transformation.
 */
export const cssFormatHex = (hex: string, format: "short" | "long" = "short") => {
	let text = hex.toUpperCase();
	if (!text.startsWith("#")) {
		text = "#".concat(text);
	}
	if (format === "long" && text.length < 6) {
		text = text.replace(/^#([A-F0-9])([A-F0-9])([A-F0-9])([A-F0-9])?$/, (_all, r: string, g: string, b: string, a: string | undefined) => {
			const replacement = [ "#", r, r, g, g, b, b ];
			if (a != null) {
				replacement.push(a, a);
			}
			return replacement.join("");
		});
	} else if (format === "short" && text.length > 4) {
		text = text.replace(/^#([A-F0-9])\1([A-F0-9])\2([A-F0-9])\3(?:([A-F0-9])\4)?$/, (_all, r: string, g: string, b: string, a: string | undefined) => {
			const replacement = [ "#", r, g, b ];
			if (a != null) {
				replacement.push(a);
			}
			return replacement.join("");
		});
	}
	return text;
};
