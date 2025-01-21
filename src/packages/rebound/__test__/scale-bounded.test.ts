import { expect } from "chai";
import { describe, test } from "mocha";
import { scaleBounded } from "../scale-bounded.js";
import type { TypedCheckedBounds } from "../spec.js";

describe(scaleBounded.name, () => {
	const range01 = 1 - Number.MIN_VALUE;
	const float01: TypedCheckedBounds = {
		isInt: false,
		isLowerInc: true,
		isUpperInc: false,
		lower: 0,
		range: "[0 real 1)",
		typeName: "Float01",
		upper: 1,
	};
	const byte: TypedCheckedBounds = {
		isInt: true,
		isLowerInc: true,
		isUpperInc: true,
		lower: 0,
		range: "[0 int 255]",
		typeName: "Byte",
		upper: 255,
	};
	const twoEight: TypedCheckedBounds = {
		isInt: true,
		isLowerInc: true,
		isUpperInc: true,
		lower: 2,
		range: "[2 int 8]",
		typeName: "TwoEight",
		upper: 8,
	};
	test("float01 -> byte", () => {
		const scale = scaleBounded(float01, byte, false);
		expect(scale.name).eq("byteFromFloat01");
		expect(scale(0), "0").eq(0);
		expect(scale(range01), "<1").eq(255);
		expect(scale(0.5), "0.5").eq(127);
		for (let i = 0; i < 255; i++) {
			const f = i / 255;
			expect(scale(f), f.toPrecision(6)).eq(i);
		}
	});
	test("byte -> float", () => {
		const scale = scaleBounded(byte, float01, false);
		expect(scale.name).eq("float01FromByte");
		expect(scale(0), "0").eq(0);
		expect(scale(255), "255").eq(range01);
		const epsilon = 0.25 / 255;
		for (let i = 0; i < 255; i++) {
			const f = (i * range01) / 255;
			expect(scale(i), String(i)).closeTo(f, epsilon);
		}
	});
	test("float01 -> twoEight", () => {
		const scale = scaleBounded(float01, twoEight, false);
		expect(scale.name).eq("twoEightFromFloat01");
		expect(scale(0), "0").eq(2);
		expect(scale(range01), "<1").eq(8);
		for (let i = 2; i <= 8; i++) {
			const f = range01 * ((i - 2) / 6);
			expect(scale(f), `${ f.toPrecision(4) } -> ${ i }`).eq(i);
		}
	});
	test("twoEight -> float01", () => {
		const scale = scaleBounded(twoEight, float01, false);
		expect(scale.name).eq("float01FromTwoEight");
		expect(scale(2), "2").eq(0);
		expect(scale(8), "8").eq(range01);
		for (let i = 2; i <= 8; i++) {
			const f = range01 * ((i - 2) / 6);
			expect(scale(i), `${i} -> ${ f.toPrecision(4) }`).closeTo(f, 0.00001);
		}
	});
});
