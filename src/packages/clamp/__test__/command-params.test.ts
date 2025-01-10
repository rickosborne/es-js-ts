import { expect } from "chai";
import { describe, it } from "mocha";
import { commandParams } from "../command-params.js";

describe(commandParams.name, () => {
	it("handles long params", () => {
		const { boom, date, files, flag, num, str, unused } = commandParams({
			boom: {
				type: Boolean,
			},
			date: {
				type: Date,
			},
			files: {
				multiple: true,
				path: "some/path",
				positional: true,
				type: "file",
			},
			flag: { type: Boolean },
			num: {
				integer: true,
				maximum: 200,
				minimum: 100,
				type: Number,
			},
			str: { trim: true },
			unused: {
				optional: true,
				type: Boolean,
			},
		}, {
			args: [
				"--date",
				"2024-12-28",
				"--str",
				" text ",
				"--flag",
				"package.json",
				"--no-boom",
				"--num",
				"123",
				"--",
				"some/path/package-lock.json",
			],
		});
		expect(str, "str").eq("text");
		expect(date, "date").eql(new Date(2024, 11, 28));
		expect(flag, "flag").eq(true);
		expect(files.map((f) => f.filePath), "files").eql([ "some/path/package.json", "some/path/package-lock.json" ]);
		expect(num, "num").eq(123);
		expect(boom, "boom").eq(false);
		expect(unused, "unused").eq(undefined);
	});
	it("throws for unexpected", () => {
		let error: Error | undefined;
		const result = commandParams({}, {
			args: [ "--reporter" ],
			onError: (err) => {
				error = err;
			},
		});
		expect(result, "result").eq(undefined);
		expect(error).instanceOf(Error);
		expect(error?.message).matches(/Unexpected arg/);
	});
	it("won't throw if told to ignore", () => {
		const result = commandParams({
			whatever: {},
		}, {
			args: [ "--reporter", "--whatever", "abc" ],
			ignoreUnknown: true,
			onError: (cause) => {
				throw new Error("Should not have been called", { cause });
			},
		});
		expect(result, "result").eql({ whatever: "abc" });
	});
});
