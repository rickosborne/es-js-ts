import { expect } from "chai";
import { describe, test } from "mocha";
import { assignJSONPath } from "../assign-json-path.js";

describe(assignJSONPath.name, () => {
	test("simple creation", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$.basics", "baz");
		expect(target).eql({ foo: "bar", basics: "baz" });
	});
	test("simple overwrite", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$.foo", "baz");
		expect(target).eql({ foo: "baz" });
	});
	test("nest obj", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$.nest.basics", "baz");
		expect(target).eql({ foo: "bar", nest: { basics: "baz" } });
	});
	test("nest list", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$.nest[0]", "baz");
		expect(target).eql({ foo: "bar", nest: [ "baz" ] });
	});
	test("nest list obj", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$.nest[1].basics", "baz");
		expect(target).eql({ foo: "bar", nest: [ undefined, { basics: "baz" } ] });
	});
	test("next obj list", () => {
		const target = { foo: "bar" };
		assignJSONPath(target, "$['nest']['basics'][1]", "baz");
		expect(target).eql({ foo: "bar", nest: { basics: [ undefined, "baz" ] } });
	});
});
