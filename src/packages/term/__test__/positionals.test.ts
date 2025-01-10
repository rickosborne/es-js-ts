import { expect } from "chai";
import { describe, it } from "mocha";
import { positionalArgs } from "../positionals.js";

describe(positionalArgs.name, () => {
	it("handles all the basic cases", () => {
		expect(positionalArgs([
			"--project",
			"tsconfig.json",
			"-v",
			"--inline-value=true",
			"positional.log",
		]), "reasonable").eql([ "positional.log" ]);
		expect(positionalArgs([
			"1.log",
			"--project",
			"tsconfig.json",
			"2.log",
			"-v",
			"3.log",
			"--inline-value=true",
			"-flag",
			"flag-value",
			"-other-flag=other-value",
			"4.log",
		]), "monster").eql([ "1.log", "2.log", "3.log", "4.log" ]);
	});

	it("ignores '.' unless told otherwise", () => {
		expect(positionalArgs([ ".", "5.log" ])).eql([ "5.log" ]);
		expect(positionalArgs([ ".", "6.log" ], { ignoreDot: false })).eql([ ".", "6.log" ]);
	});
});
