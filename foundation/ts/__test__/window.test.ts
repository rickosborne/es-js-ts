import { expect } from "chai";
import { describe, it } from "mocha";
import { window2, window3 } from "../window.js";

describe(window2.name, () => {
	it("works for an empty list", () => {
		expect(Array.from(window2([ ]))).eql([
		]);
	});
	it("works for 1 value", () => {
		expect(Array.from(window2([ "a" ]))).eql([
			[ "a", "a", 0, 0 ],
		]);
	});
	it("works for 2 values", () => {
		expect(Array.from(window2([ "a", "b" ]))).eql([
			[ "a", "b", 0, 1 ],
			[ "b", "a", 1, 0 ],
		]);
	});
	it("works for 3 values", () => {
		expect(Array.from(window2([ "a", "b", "c" ]))).eql([
			[ "a", "b", 0, 1 ],
			[ "b", "c", 1, 2 ],
			[ "c", "a", 2, 0 ],
		]);
	});
});


describe(window3.name, () => {
	it("works for an empty list", () => {
		expect(Array.from(window3([ ]))).eql([
		]);
	});
	it("works for 1 value", () => {
		expect(Array.from(window3([ "a" ]))).eql([
			[ "a", "a", "a", 0, 0, 0 ],
		]);
	});
	it("works for 2 values", () => {
		expect(Array.from(window3([ "a", "b" ]))).eql([
			[ "b", "a", "b", 1, 0, 1 ],
			[ "a", "b", "a", 0, 1, 0 ],
		]);
	});
	it("works for 3 values", () => {
		expect(Array.from(window3([ "a", "b", "c" ]))).eql([
			[ "c", "a", "b", 2, 0, 1 ],
			[ "a", "b", "c", 0, 1, 2 ],
			[ "b", "c", "a", 1, 2, 0 ],
		]);
	});
	it("works for 4 values", () => {
		expect(Array.from(window3([ "a", "b", "c", "d" ]))).eql([
			[ "d", "a", "b", 3, 0, 1 ],
			[ "a", "b", "c", 0, 1, 2 ],
			[ "b", "c", "d", 1, 2, 3 ],
			[ "c", "d", "a", 2, 3, 0 ],
		]);
	});
});
