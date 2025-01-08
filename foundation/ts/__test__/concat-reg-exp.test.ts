import { expect } from "chai";
import { describe, it } from "mocha";
import { concatRegExp } from "../concat-reg-exp.js";

describe(concatRegExp.name, () => {
	it("works for simple cases", () => {
		expect(concatRegExp(/foo/, /bar/)).eql(/foobar/);
		expect(concatRegExp(/^foo$/, /^bar$/)).eql(/^foobar$/);
		expect(concatRegExp(/foo/, /^bar$/)).eql(/foobar$/);
		expect(concatRegExp(/^foo$/, /bar/)).eql(/^foobar/);
		expect(concatRegExp(/^foo\$/, /\^bar/)).eql(/^foo\$\^bar/);
		expect(concatRegExp(/^foo\\$/, /bar/)).eql(/^foo\\bar/);
	});
	it("combines flags", () => {
		expect(concatRegExp(/foo/is, /bar/ig)).eql(/foobar/isg);
	});
});
