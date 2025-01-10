import { expect } from "chai";
import { describe, it } from "mocha";
import { isCircle, isDirectedSegment, isLineSegment, isPath, isPoint, isRect } from "../is-shape.js";

const empty = {};
const xOnly = { x: 1 };
const point = { x: 1, y: 2 };
const directed = { a: { x: 1, y: 2 }, b: { x: 0, y: 4 } };
const rect = { h: 3, w: 4, x: 1, y: 2 };
const circle = { r: 3, x: 1, y: 2 };
const path = { points: [ { x: 1, y: 2 }, { x: 3, y: 5 } ] };
const segment = { blue: { x: 1, y: 2 }, gold: { x: 3, y: 5 } };

describe(isPoint.name, () => {
	it("wants at least x and y", () => {
		expect(isPoint(empty), "empty").eq(false);
		expect(isPoint(xOnly), "x only").eq(false);
		expect(isPoint(path), "path").eq(false);
		expect(isPoint(segment), "segment").eq(false);
		expect(isPoint(directed), "directed").eq(false);

		expect(isPoint({ ...point, x: "a" }), "point-x").eq(false);
		expect(isPoint({ ...point, y: "a" }), "point-y").eq(false);

		expect(isPoint(point), "point").eq(true);
		expect(isPoint(rect), "rect").eq(true);
		expect(isPoint(circle), "circle").eq(true);
	});
});

describe(isRect.name, () => {
	it("wants at least x, y, w, h", () => {
		expect(isRect(empty), "empty").eq(false);
		expect(isRect(xOnly), "x only").eq(false);
		expect(isRect(path), "path").eq(false);
		expect(isRect(segment), "segment").eq(false);
		expect(isRect(circle), "circle").eq(false);
		expect(isRect(point), "point").eq(false);
		expect(isRect(directed), "directed").eq(false);

		expect(isRect({ ...rect, x: "a" }), "rect-x").eq(false);
		expect(isRect({ ...rect, y: "a" }), "rect-y").eq(false);
		expect(isRect({ ...rect, w: "a" }), "rect-w").eq(false);
		expect(isRect({ ...rect, h: "a" }), "rect-h").eq(false);

		expect(isRect(rect), "rect").eq(true);
		expect(isRect({ ...rect, area: -Infinity }), "rect+").eq(true);
	});
});

describe(isPath.name, () => {
	it("wants a list of points", () => {
		expect(isPath(empty), "empty").eq(false);
		expect(isPath(xOnly), "x only").eq(false);
		expect(isPath(segment), "segment").eq(false);
		expect(isPath(circle), "circle").eq(false);
		expect(isPath(point), "point").eq(false);
		expect(isPath(rect), "rect").eq(false);
		expect(isPath(directed), "directed").eq(false);

		expect(isPath({ points: [ { ...point, x: "a" } ] }), "broken point, shallow").eq(true);
		expect(isPath({ points: [ { ...point, x: "a" } ] }, true), "broken point, deep").eq(false);

		expect(isPath(path), "path").eq(true);
		expect(isPath({ ...path, area: Infinity }), "path+").eq(true);
		expect(isPath({ points: [] }), "empty path").eq(true);
		expect(isPath({ points: [ point ] }), "single point").eq(true);
	});
});

describe(isCircle.name, () => {
	it("wants at least x, y, and r", () => {
		expect(isCircle(empty), "empty").eq(false);
		expect(isCircle(xOnly), "x only").eq(false);
		expect(isCircle(segment), "segment").eq(false);
		expect(isCircle(point), "point").eq(false);
		expect(isCircle(rect), "rect").eq(false);
		expect(isCircle(path), "path").eq(false);
		expect(isCircle(directed), "directed").eq(false);

		expect(isCircle({ ...circle, x: "a" }), "circle-x").eq(false);
		expect(isCircle({ ...circle, y: "a" }), "circle-y").eq(false);
		expect(isCircle({ ...circle, r: "a" }), "circle-r").eq(false);

		expect(isCircle(circle), "circle").eq(true);
		expect(isCircle({ ...circle, area: Infinity }), "circle+").eq(true);
	});
});

describe(isLineSegment.name, () => {
	it("wants at least blue and gold points", () => {
		expect(isLineSegment(empty), "empty").eq(false);
		expect(isLineSegment(xOnly), "x only").eq(false);
		expect(isLineSegment(point), "point").eq(false);
		expect(isLineSegment(rect), "rect").eq(false);
		expect(isLineSegment(path), "path").eq(false);
		expect(isLineSegment(circle), "circle").eq(false);
		expect(isLineSegment(directed), "directed").eq(false);

		expect(isLineSegment({ ...segment, blue: "a" }), "segment-blue").eq(false);
		expect(isLineSegment({ ...segment, blue: { x: 1, y: "a" } }), "segment-blue.y").eq(false);
		expect(isLineSegment({ ...segment, gold: "a" }), "segment-gold").eq(false);
		expect(isLineSegment({ ...segment, gold: { x: 1, y: "a" } }), "segment-gold.y").eq(false);

		expect(isLineSegment(segment), "segment").eq(true);
		expect(isLineSegment({ ...segment, area: Infinity }), "segment+").eq(true);
	});
});

describe(isDirectedSegment.name, () => {
	it("wants at least a and b points", () => {
		expect(isDirectedSegment(empty), "empty").eq(false);
		expect(isDirectedSegment(xOnly), "x only").eq(false);
		expect(isDirectedSegment(point), "point").eq(false);
		expect(isDirectedSegment(rect), "rect").eq(false);
		expect(isDirectedSegment(path), "path").eq(false);
		expect(isDirectedSegment(circle), "circle").eq(false);
		expect(isDirectedSegment(segment), "segment").eq(false);

		expect(isDirectedSegment({ ...directed, a: "a" }), "directed-a").eq(false);
		expect(isDirectedSegment({ ...directed, a: { x: 1, y: "a" } }), "directed-a.y").eq(false);
		expect(isDirectedSegment({ ...directed, b: "a" }), "directed-b").eq(false);
		expect(isDirectedSegment({ ...directed, b: { x: 1, y: "a" } }), "directed-b.y").eq(false);

		expect(isDirectedSegment(directed), "directed").eq(true);
		expect(isDirectedSegment({ ...directed, area: Infinity }), "directed+").eq(true);
	});
});
