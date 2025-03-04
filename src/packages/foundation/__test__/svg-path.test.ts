import { expect } from "chai";
import { describe, test } from "mocha";
import { svgPathCommandsOf, svgPathValuesOf } from "../svg-path-of.js";

describe(svgPathValuesOf.name, () => {
	test("empty", () => {
		expect(Array.from(svgPathValuesOf(""))).eql([]);
	});
	test("basics", () => {
		expect(Array.from(svgPathValuesOf("M 1 -2 l 3.5, 4e6 z"))).eql([
			{ at: 0, length: 1, type: "command", value: "M" },
			{ at: 1, length: 1, type: "space", value: " " },
			{ at: 2, length: 1, type: "number", value: 1 },
			{ at: 3, length: 1, type: "space", value: " " },
			{ at: 4, length: 2, type: "number", value: -2 },
			{ at: 6, length: 1, type: "space", value: " " },
			{ at: 7, length: 1, type: "command", value: "l" },
			{ at: 8, length: 1, type: "space", value: " " },
			{ at: 9, length: 3, type: "number", value: 3.5 },
			{ at: 12, length: 2, type: "space", value: ", " },
			{ at: 14, length: 3, type: "number", value: 4000000 },
			{ at: 17, length: 1, type: "space", value: " " },
			{ at: 18, length: 1, type: "command", value: "z" },
		]);
	});
});

describe(svgPathCommandsOf.name, () => {
	test("empty", () => {
		expect(Array.from(svgPathCommandsOf(""))).eql([]);
	});
	test("basics", () => {
		expect(Array.from(svgPathCommandsOf("M 1 -2 l 3.5, 4e6 A 9 8 0 0 1 2 3 Q 4 5 6 7 T 8 9 C 0 1 2 3 4 5 s 6 7 8 9 z"))).eql([
			{ delta: false, type: "move", x: 1, y: -2 },
			{ delta: true, type: "line", x: 3.5, y: 4000000 },
			{ delta: false, large: false, rx: 9, ry: 8, sweep: true, type: "arc", x: 2, xar: 0, y: 3 },
			{ delta: false, type: "quad", x: 6, x1: 4, y: 7, y1: 5 },
			{ delta: false, type: "quad", x: 8, x1: 8, y: 9, y1: 9 },
			{ delta: false, type: "cubic", x: 4, x1: 0, x2: 2, y: 5, y1: 1, y2: 3 },
			{ delta: true, type: "cubic", x: 8, x1: 6, x2: 6, y: 9, y1: 7, y2: 7 },
			{ type: "close" },
		]);
	});
});
