import { expect } from "chai";
import { describe, test } from "mocha";
import { createReadStream, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { arrayFromAsync } from "../array-from-async.js";
import { jsonParseEventsOf, jsonParseEventsOfAsync } from "../json-parse-events-of.js";
import type { JsonParseEvent } from "../json-parse-type.js";
import { memoizeSupplier } from "../memoize.js";

const expected = memoizeSupplier(() => {
	return JSON.parse(readFileSync(pathJoin(__dirname, "cities-parse-events.fixture.json"), { encoding: "utf-8" })) as JsonParseEvent[];
});

describe(jsonParseEventsOf.name, () => {
	test("the basics", async () => {
		const json = await readFile(pathJoin(__dirname, "cities.fixture.json"), { encoding: "utf-8" });
		const events = Array.from(jsonParseEventsOf(json));
		expect(events).eql(expected());
	});
});

describe(jsonParseEventsOfAsync.name, () => {
	test("the basics", async () => {
		const asyncJson = async function* asyncJson(): AsyncGenerator<string, undefined, undefined> {
			const jsonStream = createReadStream(pathJoin(__dirname, "cities.fixture.json"), { encoding: "utf-8" });
			for await (const data of jsonStream) {
				// noinspection SuspiciousTypeOfGuard
				if (typeof data === "string") {
					yield data;
				} else {
					throw new Error(`Unexpected data type: ${ typeof data }`);
				}
			}
			jsonStream.close();
		};
		const events = await arrayFromAsync(jsonParseEventsOfAsync(asyncJson()));
		expect(events).eql(expected());
	});
});
