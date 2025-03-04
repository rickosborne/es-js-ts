import { expect } from "chai";
import { describe, test } from "mocha";
import { arrayFromAsync } from "../array-from-async.js";

describe(arrayFromAsync.name, () => {
	function *syncGen() {
		yield 1;
		yield 2;
		yield 3;
	}
	// eslint-disable-next-line @typescript-eslint/require-await
	async function *asyncGen() {
		for (const value of syncGen()) {
			yield value;
		}
	}
	test("sync generators", async () => {
		expect(await arrayFromAsync(syncGen())).eql([ 1, 2, 3 ]);
	});
	test("async generators", async () => {
		expect(await arrayFromAsync(asyncGen())).eql([ 1, 2, 3 ]);
	});
	test("arrays of promises", async () => {
		expect(await arrayFromAsync([
			1,
			Promise.resolve(2),
			3,
		])).eql([ 1, 2, 3 ]);
	});
});
