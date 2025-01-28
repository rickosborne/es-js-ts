import { entriesOf } from "@rickosborne/foundation";
import { expect } from "chai";
import type { Color, UncheckedColorParts } from "../color.js";
import type { HSL } from "../hsl.js";
import type { HSV } from "../hsv.js";
import type { IntRGB } from "../rgb.js";

export type CombinedParts = {
	rgb?: IntRGB;
	hex?: string;
	hsl?: HSL;
	hsv?: HSV;
	cssHex?: string;
	cssHSL?: string;
	cssHWB?: string;
	cssRGB?: string;
};
export const testColor = (
	color: Color | undefined,
	parts: UncheckedColorParts,
	combined?: CombinedParts,
): void => {
	if (color == null) {
		throw new Error("Expected a color");
	}
	for (const [ key, expected ] of entriesOf(parts)) {
		if (expected != null) {
			expect(color[ key ], key).closeTo(expected, 0.001);
		}
	}
	if (combined != null) {
		for (const [ key, expected ] of entriesOf(combined)) {
			const actual = color[ key ];
			if (typeof expected === "string") {
				expect(actual, key).eq(expected);
			} else if (expected != null) {
				for (const [ subKey, subValue ] of entriesOf(expected)) {
					expect((actual as IntRGB | HSL | HSV)[ subKey ], subKey).closeTo(subValue!, 0.0001);
				}
			}
		}
	}
};
