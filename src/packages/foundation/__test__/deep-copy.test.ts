import { expect } from "chai";
import { describe, it } from "mocha";
import { deepCopy } from "../deep-copy.js";

class Example {
	constructor(public readonly text: string) {
	}
}

describe(deepCopy.name, () => {
	it("allows you to substitute arrays", () => {
		const original = {
			copied: [ 1, 2, 3 ],
			example: new Example("example"),
			mapped: [ 4, 5, 6 ],
			replaced: [ 7, 8, 9 ],
		};
		const copy = deepCopy(original, {
			onArray: (value, path) => {
				expect(value).eq((original as Record<string, unknown>)[path.replace("$.", "")]);
				if (value === original.mapped) {
					return original.mapped.map((n) => n * 2);
				}
				if (value === original.copied) {
					return value;
				}
				if (value === original.replaced) {
					return "replaced!";
				}
				if (path === "$.example") {
					return value;
				}
				throw new Error(`Unexpected: ${path}`);
			},
		});
		expect(copy.copied).eql(original.copied);
		expect(copy.copied).not.eq(original.copied);
		expect(copy.mapped).eql([ 8, 10, 12 ]);
		expect(copy.replaced).eq("replaced!");
		expect(copy.example).eq(original.example);
	});
	it("allows you to substitute instances", () => {
		const original = {
			copied: new Example("copied"),
			mapped: new Example("mapped"),
			replaced: new Example("replaced"),
		};
		const mapped = new Example("MAPPED");
		const replaced = { text: "replaced!" };
		const copy = deepCopy(original, {
			onInstance: (instance, path) => {
				expect(instance).eq((original as Record<string, Example>)[path.replace("$.", "")]);
				if (path === "$.copied") {
					return instance;
				}
				if (path === "$.mapped") {
					return mapped;
				}
				if (path === "$.replaced") {
					return replaced;
				}
				throw new Error(`Unknown path: ${path}`);
			},
		});
		expect(copy.copied).eq(original.copied);
		expect(copy.mapped).eq(mapped);
		expect(copy.replaced).eql(replaced);
		expect(copy.replaced).not.eq(replaced);
	});
	it("allows you to substitute plain objects", () => {
		const original = {
			copied: { text: "copied" },
			mapped: { text: "mapped" },
			replaced: { text: "replaced" },
		};
		const mapped = { text: "MAPPED!" };
		const copy = deepCopy(original, {
			onPlainObject: (value, path) => {
				if (path.endsWith(".text")) {
					expect(value).is.a("string");
					return value;
				}
				if (path === "$") {
					expect(value).eq(original);
					return value;
				}
				expect(value).eq((original as Record<string, unknown>)[path.replace("$.", "")]);
				if (path === "$.copied") {
					return value;
				}
				if (path === "$.mapped") {
					return mapped;
				}
				if (path === "$.replaced") {
					return "replaced!";
				}
				throw new Error(`Unknown path: ${path}`);
			},
		});
		expect(copy.copied).eql(original.copied);
		expect(copy.replaced).not.eq(original.copied);
		expect(copy.mapped).eql(mapped);
		expect(copy.mapped).not.eq(mapped);
		expect(copy.replaced).eq("replaced!");
	});
	it("allows you to substitute keys", () => {
		const original = {
			nested: {
				a: "a",
				b: "b",
				c: "c",
			},
		};
		expect(Object.keys(original.nested)).eql([ "a", "b", "c" ]);
		const copy = deepCopy(original, {
			onKeys: (keys, obj, path) => {
				if (path === "$") {
					expect(obj).eq(original);
					expect(keys).eql([ "nested" ]);
					return undefined;
				}
				if (path === "$.nested") {
					expect(obj).eq(original.nested);
					expect(keys).eql([ "a", "b", "c" ]);
					return [ "c", "a" ];
				}
				throw new Error(`unknown path: ${path}`);
			},
		});
		expect(copy).eql({
			nested: {
				a: "a",
				c: "c",
			},
		});
		expect(copy).not.eq(original);
		expect(copy.nested).not.eq(original.nested);
		expect(Object.keys(copy.nested)).eql([ "c", "a" ]);
	});
});
