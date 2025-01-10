import { describe, it } from "mocha";
import { expect } from "chai";
import { DQ, reQuote, SQ } from "../re-quote.js";

describe(reQuote.name, () => {
	it("wraps bare text with the given quotes", () => {
		expect(reQuote("foo")).eq('"foo"');
	});
	it("chooses between SQ and DQ", () => {
		expect(reQuote('not "literally"')).eq(`'not "literally"'`);
		expect(reQuote("it's")).eq(`"it's"`);
		expect(reQuote(`it's not "literally"`)).eq(`'it\\'s not "literally"'`);
		expect(reQuote(`it's that'd've "literally"`)).eq(`"it's that'd've \\"literally\\""`);
	});
	it("throws for garbage", () => {
		expect(() => reQuote("foo", { quotes: "abc" })).throws(Error);
		expect(() => reQuote("foo", { quotes: "" })).throws(Error);
	});
	it("uses the given SQ/DQ", () => {
		expect(reQuote("foo", { quotes: DQ })).eq('"foo"');
		expect(reQuote("foo", { quotes: SQ })).eq("'foo'");
		expect(reQuote("foo", { quotes: "''" })).eq("'foo'");
		expect(reQuote("foo", { quotes: '""' })).eq('"foo"');
		expect(reQuote("foo", { quotes: "[]" })).eq("[foo]");
	});
	it("escapes the rq", () => {
		expect(reQuote('foo"bar"baz', { quotes: DQ })).eq('"foo\\"bar\\"baz"');
		expect(reQuote("foo'bar'baz", { quotes: SQ })).eq("'foo\\'bar\\'baz'");
		expect(reQuote("foo'bar'baz", { quotes: "''" })).eq("'foo\\'bar\\'baz'");
		expect(reQuote('foo"bar"baz', { quotes: '""' })).eq('"foo\\"bar\\"baz"');
		expect(reQuote("foo[bar]baz[quux]", { quotes: "[]" })).eq("[foo[bar\\]baz[quux\\]]");
	});
	it("detects already-quoted", () => {
		expect(reQuote('"foo"'), "dq auto").eq('"foo"');
		expect(reQuote('"foo"', { quotes: DQ }), "dq").eq('"foo"');
		expect(reQuote('"foo"', { quotes: '""' }), "dq dq").eq('"foo"');
		expect(reQuote('"foo"bar"'), "mis-escaped").eq(`'foo"bar'`);
		expect(reQuote("'foo'"), "sq auto").eq("'foo'");
		expect(reQuote("'foo'", { quotes: SQ }), "sq").eq("'foo'");
		expect(reQuote("'foo'", { quotes: "''" }), "sq sq").eq("'foo'");
		expect(reQuote("[foo]", { quotes: "[]" }), "brackets").eq("[foo]");
	});
});
