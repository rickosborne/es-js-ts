import { expect } from "chai";
import { describe, it } from "mocha";
import { optionalRegExp } from "../optional-reg-exp.js";

describe(optionalRegExp.name, () => {
	it("works for simple cases", () => {
		expect(optionalRegExp(/foo/g)).eql(/(?:foo)?/g);
		expect(optionalRegExp(/^foo$/i)).eql(/^(?:foo)?$/i);
	});
});
