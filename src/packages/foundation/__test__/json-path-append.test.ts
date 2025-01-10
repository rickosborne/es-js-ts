import { expect } from "chai";
import { describe, it } from "mocha";
import { JSON_PATH_ROOT, jsonPathAppend } from "../json-path-append.js";

describe(jsonPathAppend.name, () => {
	it("indexes integers", () => {
		expect(jsonPathAppend(JSON_PATH_ROOT, 123)).eq("$[123]");
		expect(jsonPathAppend(JSON_PATH_ROOT, 0)).eq("$[0]");
		expect(jsonPathAppend(JSON_PATH_ROOT, -0)).eq("$[0]");
		expect(jsonPathAppend(JSON_PATH_ROOT, -1)).eq("$[-1]");
	});
	it("stringifies decimals", () => {
		expect(jsonPathAppend(JSON_PATH_ROOT, 1.23)).eq('$["1.23"]');
		expect(jsonPathAppend(JSON_PATH_ROOT, -1.23)).eq('$["-1.23"]');
	});
	it("stringifies symbols", () => {
		expect(jsonPathAppend(JSON_PATH_ROOT, Symbol("foo"))).eq('$[?Symbol("foo")]');
	});
	it("dots variable-like identifiers", () => {
		expect(jsonPathAppend(JSON_PATH_ROOT, "foo")).eq("$.foo");
		expect(jsonPathAppend(JSON_PATH_ROOT, "_bar")).eq("$._bar");
		expect(jsonPathAppend(JSON_PATH_ROOT, "long_snake_case")).eq("$.long_snake_case");
	});
	it("quotes non-identifiers", () => {
		expect(jsonPathAppend(JSON_PATH_ROOT, "foo-bar")).eq('$["foo-bar"]');
		expect(jsonPathAppend(JSON_PATH_ROOT, "foo bar")).eq('$["foo bar"]');
		expect(jsonPathAppend(JSON_PATH_ROOT, "🍿")).eq('$["🍿"]');
	});
});
