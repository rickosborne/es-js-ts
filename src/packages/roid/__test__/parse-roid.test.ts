import { expect } from "chai";
import { describe, test } from "mocha";
import { type ParsedRoid, parseRoid, safeParseRoid } from "../parse-roid.js";
import { ROID_MAX_MACHINE_ID, ROID_MAX_SEQUENCE_NUMBER, ROID_MAX_TIMESTAMP } from "../roid-options.js";

describe(parseRoid.name, () => {
	test("zeros", () => {
		expect(parseRoid("HDU8U8Pz8Na")).eql({
			sequenceNumber: 0,
			machineId: 0,
			timestamp: 0,
			uint64: BigInt(1) << 62n,
		} satisfies ParsedRoid);
	});
	test("last", () => {
		expect(parseRoid("YQwEwEmyEj9")).eql({
			sequenceNumber: ROID_MAX_SEQUENCE_NUMBER,
			machineId: ROID_MAX_MACHINE_ID,
			timestamp: ROID_MAX_TIMESTAMP,
			uint64: (BigInt(1) << 63n) - 1n,
		} satisfies ParsedRoid);
	});
	test("bad length", () => {
		const [ error, id ] = safeParseRoid("HDU");
		expect(id).eq(undefined);
		expect(error).instanceOf(SyntaxError).matches(/11/);
	});
	test("bad chars", () => {
		expect(() => parseRoid("HD---------")).throws(SyntaxError).matches(/index 2/);
	});
	test("bad prefix", () => {
		expect(() => parseRoid("2zzzzzzzzzz")).throws(SyntaxError).matches(/prefix/);
	});
});
