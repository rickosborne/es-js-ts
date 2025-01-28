import { expect } from "chai";
import { describe, it } from "mocha";
import type { Stats } from "node:fs";
import { assertFileExists } from "../assert-file-exists.js";
import { FileMissingError } from "../file-missing-error.js";
import { NotFileError } from "../not-file-error.js";

describe(assertFileExists.name, () => {
	it("throws if the file does not exist", () => {
		let error: Error | undefined;
		let calledPath: string | undefined;
		try {
			assertFileExists("some/file.txt", {
				statSync: (path, options) => {
					expect(options).eql({ throwIfNoEntry: false });
					calledPath = path;
					return undefined;
				},
			});
		} catch (err: unknown) {
			if (!(err instanceof FileMissingError)) {
				throw new Error("Wrong error type", { cause: err });
			}
			expect(err.filePath, "filePath").eq("some/file.txt");
			expect(err.name, "name").eq("FileMissingError");
			expect(err.message, "message").match(/File does not exist/);
			expect(err.stack, "stack").match(/FileMissingError: File does not exist: some\/file\.txt\n\s+at\s+/);
			error = err;
		}
		expect(calledPath).eq("some/file.txt");
		expect(error, "error").not.eq(undefined);
	});
	it("throws if the file is not a file", () => {
		let error: Error | undefined;
		let calledPath: string | undefined;
		try {
			assertFileExists("some/dir", {
				statSync: (path, options) => {
					expect(options).eql({ throwIfNoEntry: false });
					calledPath = path;
					return {
						isFile: () => false,
					} as Stats;
				},
			});
		} catch (err: unknown) {
			if (!(err instanceof NotFileError)) {
				throw new Error("Wrong error type", { cause: err });
			}
			expect(err.filePath, "filePath").eq("some/dir");
			expect(err.name, "name").eq("NotFileError");
			expect(err.message, "message").match(/Not a file/);
			expect(err.stack, "stack").match(/NotFileError: Not a file: some\/dir\n\s+at\s+/);
			error = err;
		}
		expect(calledPath).eq("some/dir");
		expect(error, "error").not.eq(undefined);
	});
	it("does not throw if the file exists", () => {
		let calledPath: string | undefined;
		assertFileExists("some/file.txt", {
			statSync: (path, options) => {
				expect(options).eql({ throwIfNoEntry: false });
				calledPath = path;
				return {
					isFile: () => true,
				} as Stats;
			},
		});
		expect(calledPath).eq("some/file.txt");
	});
});
