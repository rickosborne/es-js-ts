import { expect } from "chai";
import { describe, test } from "mocha";
import { iteratorOf } from "../iterator.js";
import { singleCharactersOf } from "../single-characters-of.js";

describe(singleCharactersOf.name, () => {
	const expected = [
		"a", "b", "c", "d", "e", "f",
	];
	test("strings", () => {
		expect(Array.from(singleCharactersOf("ab", "cde", "f"))).eql(expected);
	});
	test("string iterables", () => {
		expect(Array.from(singleCharactersOf(iteratorOf("ab"), iteratorOf([ "cde", "f" ])))).eql(expected);
	});
	test("string iterators", () => {
		let at = 0;
		const original = expected.join("");
		const it: Iterator<string, undefined, undefined> = {
			next(): IteratorResult<string, undefined> {
				const sub = original.substring(at, at + 4);
				at += 4;
				if (sub === "") {
					return { done: true, value: undefined };
				} else {
					return { done: false, value: sub };
				}
			},
		};
		expect(Array.from(singleCharactersOf(it))).eql(expected);
	});
	test("string arrays", () => {
		expect(Array.from(singleCharactersOf([ "ab", "cd" ], [ "ef" ]))).eql(expected);
	});
});
