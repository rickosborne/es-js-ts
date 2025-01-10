import { describe, it } from "mocha";
import { expect } from "chai";
import { ARG_FLAG, envOrArg } from "../env-or-arg.js";

const env: Record<string, string | undefined> = {
	BLANK: "",
	lower: "low",
	SNAKE_CASE: "snake",
	TERM: "color",
};

describe(envOrArg.name, () => {
	it("does its best with env", () => {
		expect(envOrArg("TERM", { argv: [ "" ], env })).eq("color");
		expect(envOrArg([ "TERM" ], { argv: [ "" ], env })).eq("color");
		expect(envOrArg("term", { argv: [ "" ], env })).eq("color");
		expect(envOrArg("SNAKE_CASE", { argv: [ "" ], env })).eq("snake");
		expect(envOrArg("snake_case", { argv: [ "" ], env })).eq("snake");
		expect(envOrArg("lower", { argv: [ "" ], env })).eq("low");
		expect(envOrArg("BLANK", { argv: [ "" ], env })).eq(undefined);
		expect(envOrArg("BLANK", { allowBlank: true, argv: [ "" ], env })).eq("");
	});
	it("does its best with params", () => {
		expect(envOrArg("simple", { argv: [ "--garbage", "--simple", "s" ], env: {} })).eq("s");
		expect(envOrArg("simple", { argv: [ "--garbage", "--simple", "" ], env: {} })).eq(undefined);
		expect(envOrArg("--simple", { argv: [ "--garbage", "--simple", "s" ], env: {} })).eq("s");
		expect(envOrArg("-simple", { argv: [ "--garbage", "--simple", "s" ], env: {} })).eq(undefined);
		expect(envOrArg("simple", { allowBlank: true, argv: [ "--garbage", "--simple", "" ], env: {} })).eq("");
		expect(envOrArg("simple", { argv: [ "--simple", "--garbage" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("simple", { argv: [ "--garbage", "--simple", "-v" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("simple", { argv: [ "--garbage", "--simple=s", "-v" ], env: {} })).eq("s");
		expect(envOrArg("simple", { argv: [ "--simple" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("simple", { argv: [ "--simple=s" ], env: {} })).eq("s");
		expect(envOrArg("s", { argv: [ "-s", "t" ], env: {} })).eq("t");
		expect(envOrArg("-s", { argv: [ "-s", "t" ], env: {} })).eq("t");
		expect(envOrArg("s", { argv: [ "-s=t", "u" ], env: {} })).eq("t");
		expect(envOrArg("s", { argv: [ "-s", "-u" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("s", { argv: [ "-s" ], env: {} })).eq(ARG_FLAG);
	});
	it("tries to convert arg to env", () => {
		expect(envOrArg("snake-case", { argv: [], env })).eq("snake");
		expect(envOrArg("-snake-case", { argv: [], env })).eq("snake");
		expect(envOrArg("--snake-case", { argv: [], env })).eq("snake");
	});
	it("tries to convert env to arg", () => {
		expect(envOrArg("SNAKE_CASE", { argv: [ "--snake-case" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("SNAKE_CASE", { argv: [ "-snake-case" ], env: {} })).eq(undefined);
		expect(envOrArg("SNAKE_CASE", { argv: [ "--snake-case", "s" ], env: {} })).eq("s");
		expect(envOrArg("SNAKE_CASE", { argv: [ "-snake-case", "s" ], env: {} })).eq(undefined);
		expect(envOrArg("SNAKE_CASE", { argv: [ "--snake-case=s", "t" ], env: {} })).eq("s");
		expect(envOrArg("SNAKE_CASE", { argv: [ "-snake-case=s", "t" ], env: {} })).eq(undefined);
	});
	it("throws for more than one arg", () => {
		expect(() => envOrArg("s", { argv: [ "-s", "t", "-s", "u" ], env: {} })).throws(Error);
		expect(() => envOrArg("s", { argv: [ "-s", "-t", "-s", "u" ], env: {} })).throws(Error);
		expect(envOrArg("s", { argv: [ "-s", "-t", "-s", "-u" ], env: {} })).eq(ARG_FLAG);
		expect(envOrArg("s", { argv: [ "-s", "-t", "--s", "-u" ], env: {} })).eq(ARG_FLAG);
	});
});
