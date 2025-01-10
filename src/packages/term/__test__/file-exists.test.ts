import { describe, it } from "mocha";
import { expect } from "chai";
import * as path from "node:path";
import { fileExists } from "../file-exists.js";

describe(fileExists.name, () => {
	it("is true if the dir ent is a file", () => {
		let called: string | undefined;
		expect(fileExists((path, options) => {
			expect(options).eql({ throwIfNoEntry: false });
			called = path;
			return { isFile: () => true };
		}, "parent", "child")).eq(true);
		expect(called).eq(path.join("parent", "child"));
	});
	it("is false if the dir ent is not a file", () => {
		let called: string | undefined;
		expect(fileExists((path, options) => {
			expect(options).eql({ throwIfNoEntry: false });
			called = path;
			return { isFile: () => false };
		}, "parent", "child")).eq(false);
		expect(called).eq(path.join("parent", "child"));
	});
});
