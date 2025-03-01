import { describe, test } from "mocha";
import { expect } from "chai";
import { readFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { asyncIteratorFor } from "../iterator.js";
import { JsonParseObserver } from "../json-parse-observer.js";

describe(JsonParseObserver.name, () => {
	test("the basics", async () => {
		const json = await readFile(pathJoin(__dirname, "cities.fixture.json"), { encoding: "utf-8" });
		const iterator = asyncIteratorFor(json[Symbol.iterator]());
		const observer = JsonParseObserver.forIterator(iterator);
		const events = await Array.fromAsync(observer);
		expect(events.map((e) => {
			const { at, length, line, pos, ...rest } = e;
			return rest;
		})).eql([
			{
				path: "$",
				transition: "begin",
				type: "object",
			},
			{
				key: "city",
				path: "$.city",
				transition: "begin",
				type: "property",
			},
			{
				count: 0,
				path: "$.city",
				transition: "begin",
				type: "array",
			},
			{
				index: 0,
				path: "$.city[0]",
				primitive: "Paris",
				transition: "begin",
				type: "item",
			},
			{
				index: 0,
				path: "$.city[0]",
				primitive: "Paris",
				transition: "end",
				type: "item",
			},
			{
				index: 1,
				path: "$.city[1]",
				primitive: "London",
				transition: "begin",
				type: "item",
			},
			{
				index: 1,
				path: "$.city[1]",
				primitive: "London",
				transition: "end",
				type: "item",
			},
			{
				count: 2,
				path: "$.city",
				transition: "end",
				type: "array",
			},
			{
				key: "city",
				path: "$.city",
				transition: "end",
				type: "property",
			},
			{
				key: "count",
				path: "$.count",
				transition: "begin",
				type: "property",
			},
			{
				key: "count",
				path: "$.count",
				primitive: -2.5,
				transition: "end",
				type: "property",
			},
			{
				key: "missing",
				path: "$.missing",
				transition: "begin",
				type: "property",
			},
			{
				key: "missing",
				path: "$.missing",
				primitive: null,
				transition: "end",
				type: "property",
			},
			{
				key: "ordered",
				path: "$.ordered",
				transition: "begin",
				type: "property",
			},
			{
				key: "ordered",
				path: "$.ordered",
				primitive: false,
				transition: "end",
				type: "property",
			},
			{
				key: "present",
				path: "$.present",
				transition: "begin",
				type: "property",
			},
			{
				key: "present",
				path: "$.present",
				primitive: true,
				transition: "end",
				type: "property",
			},
			{
				path: "$",
				transition: "end",
				type: "object",
			},
		]);
	});
});
