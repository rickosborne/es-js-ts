import { isDigit, ValidationError } from "@rickosborne/guard";
import type { BiPredicate } from "@rickosborne/typical";
import { use as chaiUse, expect } from "chai";
import { describe, it, test } from "mocha";
import { AsyncStringTokenizer, StringTokenizer } from "../string-tokenizer.js";
import { default as chaiAsPromised } from "chai-as-promised";

chaiUse(chaiAsPromised);

interface TestableTokenizer {
	get at(): number;
	consumeCount(length: number): string | Promise<string>;
	consumeExact(exact: string): string | Promise<string>;
	consumeSpace(): string | Promise<string>;
	consumeWhile(predicate: BiPredicate<string, number>): string | Promise<string>;
	get done(): boolean;
	get lookahead(): number;
	peek(forward?: number): string | undefined | Promise<string | undefined>;
	get text(): string | undefined;
	tryConsume(exact: string): boolean | Promise<boolean>;
}

const tokenizers: {
	name: string,
	forText: (text: string, at?: number) => TestableTokenizer;
}[] = [
	{ name: StringTokenizer.name, forText: (text, at) => StringTokenizer.forText(text, at) },
	{ name: AsyncStringTokenizer.name, forText: (text, at) => AsyncStringTokenizer.forText(text, at) },
];

const toPromise = <T>(runnable: () => T | Promise<T>): Promise<T> => {
	return new Promise((resolve, reject) => {
		try {
			resolve(runnable());
		} catch (err: unknown) {
			reject(err);
		}
	});
};

for (const testable of tokenizers) {
	describe(testable.name, () => {
		describe("at", () => {
			it("starts at zero", () => {
				expect(testable.forText("abc").at, "at").eq(0);
			});
		});
		describe("text", () => {
			it("returns the original text", () => {
				expect(testable.forText("abc").text, "text").eq("abc");
			});
			it("returns the original text, even when given a starting offset", () => {
				expect(testable.forText("abc", 3).text, "sync text").eq("abc");
			});
		});
		describe("consumeWhile", () => {
			it("returns an empty string when given an empty string", async () => {
				const tokenizer = testable.forText("");
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.consumeWhile(isDigit)).eq("");
				expect(tokenizer.done, "done:after").eq(true);
			});
			it("returns an empty string when already past the end", async () => {
				const tokenizer = testable.forText("abc", 3);
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.consumeWhile(isDigit)).eq("");
				expect(tokenizer.done, "done:after").eq(false);
			});
			it("returns an empty string when no match", async () => {
				const tokenizer = testable.forText("abc");
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.consumeWhile(isDigit)).eq("");
				expect(tokenizer.done, "done:after").eq(false);
			});
			it("returns the matched string", async () => {
				const tokenizer = testable.forText("123abc");
				expect(await tokenizer.consumeWhile(isDigit)).eq("123");
				expect(tokenizer.at, "at").eq(3);
				expect(tokenizer.done, "done").eq(false);
			});
		});
		describe("peek", () => {
			test("start of text", async () => {
				const tokenizer = testable.forText("abc");
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.peek(), "peek").eq("a");
				expect(await tokenizer.peek(0), "peek").eq("a");
				expect(tokenizer.done, "done:after").eq(false);
			});
			test("consume all text", async () => {
				const tokenizer = testable.forText("abc");
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.peek(0), "peek(0)").eq("a");
				expect(await tokenizer.peek(2), "peek(2)").eq("c");
				expect(await tokenizer.peek(1), "peek(1)").eq("b");
				expect(await tokenizer.peek(3), "peek(3)").eq(undefined);
				expect(await tokenizer.peek(3), "peek(3)").eq(undefined);
				expect(await tokenizer.peek(), "peek()").eq("a");
				expect(tokenizer.done, "done:after").eq(false);
			});
			test("peek then consume", async () => {
				const tokenizer = testable.forText("123abc");
				expect(tokenizer.done, "done:before").eq(false);
				expect(await tokenizer.peek(3), "peek(3)").eq("a");
				expect(tokenizer.lookahead, "lookahead:before").eq(4);
				expect(tokenizer.at, "at:before").eq(0);
				expect(await tokenizer.consumeWhile(isDigit), "consumeWhile(isDigit)").eq("123");
				expect(tokenizer.at, "at:after").eq(3);
				expect(tokenizer.lookahead, "lookahead:after").eq(1);
				expect(tokenizer.done, "done:after").eq(false);
			});
			it("throws when given a negative", async () => {
				await expect(toPromise(() => testable.forText("abc").peek(-1))).eventually.rejectedWith(RangeError);
			});
		});
		describe("consumeCount", () => {
			test("zero", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeCount(0)).eq("");
				expect(tokenizer.at, "at").eq(0);
				expect(tokenizer.done, "done").eq(false);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("full", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeCount(3)).eq("abc");
				expect(tokenizer.at, "at").eq(3);
				expect(tokenizer.done, "done").eq(false);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("substring", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeCount(2)).eq("ab");
				expect(tokenizer.at, "at").eq(2);
				expect(tokenizer.done, "done").eq(false);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("more", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeCount(4)).eq("abc");
				expect(tokenizer.at, "at").eq(3);
				expect(tokenizer.done, "done").eq(true);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("bad length", async () => {
				await expect(toPromise(() => testable.forText("abc").consumeCount(-1)), "-1").eventually.rejectedWith(RangeError);
				await expect(toPromise(() => testable.forText("abc").consumeCount(1.5)), "1.5").eventually.rejectedWith(RangeError);
			});
		});
		describe("consumeExact", () => {
			test("empty", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeExact("")).eq("");
				expect(tokenizer.at, "at").eq(0);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("substring", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeExact("ab")).eq("ab");
				expect(tokenizer.at, "at").eq(2);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("full", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeExact("abc")).eq("abc");
				expect(tokenizer.at, "at").eq(3);
				expect(tokenizer.lookahead, "lookahead").eq(0);
			});
			test("wrong", async () => {
				const tokenizer = testable.forText("banana");
				await expect(toPromise(() => tokenizer.consumeExact("bane"))).eventually.rejectedWith(ValidationError);
				expect(tokenizer.at, "at").eq(0);
				expect(tokenizer.lookahead, "lookahead").eq(4);
				await expect(toPromise(() => tokenizer.consumeExact("abracadabra"))).eventually.rejectedWith(ValidationError);
				expect(tokenizer.at, "at").eq(0);
				expect(tokenizer.lookahead, "lookahead").eq(6);
				expect(await tokenizer.consumeExact("ban")).eq("ban");
				expect(tokenizer.at, "at").eq(3);
				expect(tokenizer.lookahead, "lookahead").eq(3);
			});
		});
		describe("consumeSpace", () => {
			test("none", async () => {
				const tokenizer = testable.forText("abc");
				expect(await tokenizer.consumeSpace()).eq("");
			});
			test("some", async () => {
				const tokenizer = testable.forText(" \t\n\f\rabc");
				expect(await tokenizer.consumeSpace()).eq(" \t\n\f\r");
				expect(tokenizer.at).eq(5);
			});
		});
	});
}

describe(StringTokenizer.name, () => {
	test(StringTokenizer.forIterator.name, () => {
		const text = "123abc";
		const tokenizer = StringTokenizer.forIterator(text[Symbol.iterator]());
		expect(tokenizer.done, "done:before").eq(false);
		expect(tokenizer.consumeWhile(isDigit)).eq("123");
		expect(tokenizer.done, "done:mid1").eq(false);
		expect(tokenizer.consumeExact("abc")).eq("abc");
		expect(tokenizer.done, "done:mid2").eq(false);
		expect(tokenizer.consumeSpace()).eq("");
		expect(tokenizer.done).eq(true);
	});
});
