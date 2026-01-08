import { expect } from "chai";
import { describe, test } from "mocha";
import { bigintFromBase56 } from "../bigint-from-base56.js";

describe(bigintFromBase56.name, () => {
	test("bad text", () => {
		const [ error, big ] = bigintFromBase56("ABC123");
		expect(big).eq(undefined);
		expect(error).instanceOf(SyntaxError);
		expect(error?.message).matches(/index 3/);
	});
	test("empty text", () => {
		expect(bigintFromBase56("")).eql([ undefined, 0n ]);
	});
	test("zero", () => {
		expect(bigintFromBase56("2")).eql([ undefined, 0n ]);
	});
	test("one", () => {
		expect(bigintFromBase56("3")).eql([ undefined, 1n ]);
	});
	test("multiple", () => {
		expect(bigintFromBase56("324")).eql([ undefined, 56n * 56n + 2n ]);
	});
});
