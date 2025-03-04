import { expect } from "chai";
import { describe, test } from "mocha";
import { createReadStream, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { arrayFromAsync } from "../array-from-async.js";
import type { JsonToken } from "../json-token.js";
import { jsonTokensOf, jsonTokensOfAsync } from "../json-tokens-of.js";
import { memoizeSupplier } from "../memoize.js";

const expected = memoizeSupplier(() => JSON.parse(readFileSync(pathJoin(__dirname, "cities-tokens.fixture.json"), { encoding: "utf-8" })) as JsonToken[]);

describe(jsonTokensOf.name, () => {
	test("static text", async () => {
		const json = await readFile(pathJoin(__dirname, "cities.fixture.json"), { encoding: "utf-8" });
		expect(Array.from(jsonTokensOf(json))).eql(expected());
	});
});

describe(jsonTokensOfAsync.name, () => {
	test("static text", async () => {
		async function* asyncJson(): AsyncGenerator<string, undefined, undefined> {
			const jsonStream = createReadStream(pathJoin(__dirname, "cities.fixture.json"), { encoding: "utf-8" });
			for await (const text of jsonStream) {
				// noinspection SuspiciousTypeOfGuard
				if (typeof text === "string") {
					yield text;
				} else {
					throw new Error(`Expected string, found: ${typeof text}`);
				}
			}
		}
		expect(await arrayFromAsync(jsonTokensOfAsync(asyncJson()))).eql(expected());
	});
});
