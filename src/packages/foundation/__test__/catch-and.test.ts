import { use as chaiUse, expect } from "chai";

import { default as chaiAsPromised } from "chai-as-promised";
import { describe, test } from "mocha";
import { addProperties } from "../add-property.js";
import { catchAnd } from "../catch-and.js";
import type { LogLike } from "../logger.js";

chaiUse(chaiAsPromised);

const oops = async (err: unknown): Promise<unknown> => {
	return Promise.reject(err);
};

const testableLogger = (): LogLike & { readonly callCount: number, clear(): void, readonly logged: unknown[] } => {
	let callCount = 0;
	const logged: unknown[] = [];
	const log = (...args: unknown[]) => {
		logged.push(...args);
		callCount++;
	};
	return addProperties(log, {
		callCount: {
			get: () => callCount,
		},
		clear: {
			value: (): void => {
				logged.splice(0, logged.length);
			},
		},
		logged: {
			get: () => logged,
		},
	});
};

describe(catchAnd.name, () => {
	const originalMessageError = () => new Error("original message");
	test("messages for Errors", async () => {
		const logger = testableLogger();
		await expect(oops(originalMessageError()).catch(catchAnd({ logger, message: "whole message" }))).eventually.rejectedWith(Error, "original message");
		expect(logger.logged).eql([ "whole message" ]);
	});
	test("messages for non-Errors", async () => {
		const logger = testableLogger();
		await expect(oops("original message").catch(catchAnd({
			logger,
			message: "whole message",
		}))).eventually.rejectedWith("original message");
		expect(logger.logged).eql([ "whole message" ]);
	});
	test("messages for non-Errors with logIf", async () => {
		const logger = testableLogger();
		await expect(oops("original message").catch(catchAnd({
			logger,
			logIf(reason: unknown) {
				expect(reason).eq("original message");
				return false;
			},
			message: "whole message",
		}))).eventually.rejectedWith("original message");
		expect(logger.logged).eql([]);
		expect(logger.callCount).eql(0);
	});
	test("messages for Errors", async () => {
		const logger = testableLogger();
		await expect(oops(originalMessageError()).catch(catchAnd({ logger, prefix: "before " }))).eventually.rejectedWith(Error, "original message");
		expect(logger.logged).eql([ "before Error original message" ]);
	});
	test("rethrow", async () => {
		const logger = testableLogger();
		const error = originalMessageError();
		await expect(oops(error).catch(catchAnd({ rethrow: true }))).eventually.rejectedWith(error);
		expect(logger.callCount).eql(0);
	});
	test("no rethrow", async () => {
		const logger = testableLogger();
		await expect(oops(originalMessageError()).catch(catchAnd({ rethrow: false }))).eventually.eq(undefined);
		expect(logger.callCount).eql(0);
	});
	test("rethrow if", async () => {
		const logger = testableLogger();
		const error = originalMessageError();
		await expect(oops(error).catch(catchAnd({
			rethrowIf(reason: unknown) {
				expect(reason).eq(error);
				return false;
			},
		}))).eventually.eq(undefined);
		expect(logger.callCount).eql(0);
	});
	test("returnValue", async () => {
		const logger = testableLogger();
		await expect(oops(originalMessageError()).catch(catchAnd({
			returnValue: "return",
		}))).eventually.eq("return");
		expect(logger.callCount).eql(0);
	});
	test("returnSupplier", async () => {
		const logger = testableLogger();
		await expect(oops(originalMessageError()).catch(catchAnd({
			returnSupplier: () => "return",
		}))).eventually.eq("return");
		expect(logger.callCount).eql(0);
	});
});
