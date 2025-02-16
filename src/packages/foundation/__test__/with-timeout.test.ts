import { expect } from "chai";
import { describe, it } from "mocha";
import { sleep } from "../sleep.js";
import { TimeoutError, withTimeout } from "../with-timeout.js";

describe(withTimeout.name, () => {
	it("throws a TimeoutError if onTimeout is not provided", async () => {
		let caught: unknown;
		await withTimeout({
			block: () => sleep(500, "never"),
			timeoutMS: 10,
		}).catch((err: unknown) => {
			caught = err;
		});
		expect(caught).is.instanceOf(TimeoutError);
	});
	it("returns the default if onTimeout is provided as function", async () => {
		const returned = await withTimeout({
			block: () => sleep(500, "never"),
			onTimeout: () => "default",
			timeoutMS: 10,
		});
		expect(returned).eq("default");
	});
	it("returns the default if onTimeout is provided as value", async () => {
		const returned = await withTimeout({
			block: () => sleep(500, "never"),
			onTimeout: "default",
			timeoutMS: 10,
		});
		expect(returned).eq("default");
	});
	it("onTimeout is not called if the promise is already resolved", async () => {
		const returned = await withTimeout({
			block: Promise.resolve("immediate"),
			onTimeout: () => {
				throw new Error("onTimeout should not have been called");
			},
			timeoutMS: 10,
		});
		expect(returned).eq("immediate");
	});
	it("onTimeout is not called if the promise resolves first", async () => {
		const returned = await withTimeout({
			block: () => sleep(10, "first"),
			onTimeout: () => {
				throw new Error("onTimeout should not have been called");
			},
			timeoutMS: 100,
		});
		expect(returned).eq("first");
	});
});
