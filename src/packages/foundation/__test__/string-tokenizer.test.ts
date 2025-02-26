import { isDigit, ValidationError } from "@rickosborne/guard";
import { expect } from "chai";
import { describe, it, test } from "mocha";
import { StringTokenizer } from "../string-tokenizer.js";

describe(StringTokenizer.name, () => {
	describe("at", () => {
		it("starts at zero", () => {
			expect(new StringTokenizer("abc").at).eq(0);
		});
		it("fixes negatives", () => {
			expect(new StringTokenizer("abc", -1).at).eq(0);
		});
		it("fixes too long", () => {
			expect(new StringTokenizer("abc", 5).at).eq(3);
		});
	});
	describe("text", () => {
		it("returns the original text", () => {
			expect(new StringTokenizer("abc").text).eq("abc");
		});
		it("returns the original text, even when given a starting offset", () => {
			expect(new StringTokenizer("abc", 3).text).eq("abc");
		});
	});
	describe(StringTokenizer.prototype.consumeWhile.name, () => {
		it("returns an empty string when given an empty string", () => {
			const tokenizer = new StringTokenizer("");
			expect(tokenizer.done, "done:before").eq(true);
			expect(tokenizer.consumeWhile(isDigit)).eq("");
			expect(tokenizer.done, "done:after").eq(true);
		});
		it("returns an empty string when already past the end", () => {
			const tokenizer = new StringTokenizer("abc", 3);
			expect(tokenizer.done, "done:before").eq(true);
			expect(tokenizer.consumeWhile(isDigit)).eq("");
			expect(tokenizer.done, "done:after").eq(true);
		});
		it("returns an empty string when no match", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.done, "done:before").eq(false);
			expect(tokenizer.consumeWhile(isDigit)).eq("");
			expect(tokenizer.done, "done:after").eq(false);
		});
		it("returns the matched string", () => {
			const tokenizer = new StringTokenizer("123abc");
			expect(tokenizer.consumeWhile(isDigit)).eq("123");
			expect(tokenizer.at, "at").eq(3);
			expect(tokenizer.done, "done").eq(false);
		});
	});
	describe(StringTokenizer.prototype.peek.name, () => {
		test("start of text", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.done, "done:before").eq(false);
			expect(tokenizer.peek(), "peek").eq("a");
			expect(tokenizer.peek(0), "peek").eq("a");
			expect(tokenizer.done, "done:after").eq(false);
		});
		test("consume all text", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.done, "done:before").eq(false);
			expect(tokenizer.peek(0), "peek(0)").eq("a");
			expect(tokenizer.peek(2), "peek(2)").eq("c");
			expect(tokenizer.peek(1), "peek(1)").eq("b");
			expect(tokenizer.peek(3), "peek(3)").eq(undefined);
			expect(tokenizer.peek(3), "peek(3)").eq(undefined);
			expect(tokenizer.peek(), "peek()").eq("a");
			expect(tokenizer.done, "done:after").eq(false);
		});
		test("peek then consume", () => {
			const tokenizer = new StringTokenizer("123abc");
			expect(tokenizer.done, "done:before").eq(false);
			expect(tokenizer.peek(3), "peek(3)").eq("a");
			expect(tokenizer.lookahead, "lookahead:before").eq(4);
			expect(tokenizer.at, "at:before").eq(0);
			expect(tokenizer.consumeWhile(isDigit), "consumeWhile(isDigit)").eq("123");
			expect(tokenizer.at, "at:after").eq(3);
			expect(tokenizer.lookahead, "lookahead:after").eq(1);
			expect(tokenizer.done, "done:after").eq(false);
		});
		it("throws when given a negative", () => {
			expect(() => new StringTokenizer("abc").peek(-1)).throws(RangeError);
		});
	});
	describe(StringTokenizer.prototype.consumeCount.name, () => {
		test("zero", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeCount(0)).eq("");
			expect(tokenizer.at, "at").eq(0);
			expect(tokenizer.done, "done").eq(false);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("full", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeCount(3)).eq("abc");
			expect(tokenizer.at, "at").eq(3);
			expect(tokenizer.done, "done").eq(true);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("substring", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeCount(2)).eq("ab");
			expect(tokenizer.at, "at").eq(2);
			expect(tokenizer.done, "done").eq(false);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("more", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeCount(4)).eq("abc");
			expect(tokenizer.at, "at").eq(3);
			expect(tokenizer.done, "done").eq(true);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("bad length", () => {
			expect(() => new StringTokenizer("abc").consumeCount(-1), "-1").throws(RangeError);
			expect(() => new StringTokenizer("abc").consumeCount(1.5), "1.5").throws(RangeError);
		});
	});
	describe(StringTokenizer.prototype.consumeExact.name, () => {
		test("empty", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeExact("")).eq("");
			expect(tokenizer.at, "at").eq(0);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("substring", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeExact("ab")).eq("ab");
			expect(tokenizer.at, "at").eq(2);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("full", () => {
			const tokenizer = new StringTokenizer("abc");
			expect(tokenizer.consumeExact("abc")).eq("abc");
			expect(tokenizer.at, "at").eq(3);
			expect(tokenizer.lookahead, "lookahead").eq(0);
		});
		test("wrong", () => {
			const tokenizer = new StringTokenizer("banana");
			expect(() => tokenizer.consumeExact("bane")).throws(ValidationError);
			expect(tokenizer.at, "at").eq(0);
			expect(tokenizer.lookahead, "lookahead").eq(4);
			expect(() => tokenizer.consumeExact("abracadabra")).throws(ValidationError);
			expect(tokenizer.at, "at").eq(0);
			expect(tokenizer.lookahead, "lookahead").eq(6);
			expect(tokenizer.consumeExact("ban")).eq("ban");
			expect(tokenizer.at, "at").eq(3);
			expect(tokenizer.lookahead, "lookahead").eq(3);
		});
	});
});
