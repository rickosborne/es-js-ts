import { describe, it } from "mocha";
import { expect } from "chai";
import { helpForParam } from "../help-for-param.js";

describe(helpForParam.name, () => {
	it("flags with 1 name", () => {
		expect(helpForParam([ "R" ], { type: String })).eq(undefined);
		expect(helpForParam([ "R" ], { placeholder: "path/to/reporter.js", type: String })).eq(undefined);
		expect(helpForParam([ "R" ], { help: "some help", type: String })).eq([
			"  -R (text)",
			"    some help",
		].join("\n"));
		expect(helpForParam([ "R" ], { help: "some help", placeholder: "path/to/reporter.js", type: String })).eq([
			"  -R path/to/reporter.js",
			"    some help",
		].join("\n"));
	});
	it("param with 1 name", () => {
		expect(helpForParam([ "reporter" ], { type: String })).eq(undefined);
		expect(helpForParam([ "reporter" ], { placeholder: "path/to/reporter.js", type: String })).eq(undefined);
		expect(helpForParam([ "reporter" ], { help: "some help", type: String })).eq([
			"  --reporter (text)",
			"    some help",
		].join("\n"));
		expect(helpForParam([ "reporter" ], { help: "some help", placeholder: "path/to/reporter.js", type: String })).eq([
			"  --reporter path/to/reporter.js",
			"    some help",
		].join("\n"));
	});
});
