import { expect } from "chai";
import { describe, it } from "mocha";
import type { PackageJsonLike } from "../package-json.js";
import { writeJson, writeText } from "../write-file.js";

describe(writeJson.name, () => {
	it("serializes package.json exports correctly", () => {
		const pkg: PackageJsonLike = {
			exports: {
				".": {
					// Notice these are out of order.
					// Default should be last.
					// Types should be earlier, but after custom.
					custom: "./custom/index.js",
					default: "./esm/index.mjs",
					import: "./esm/index.mjs",
					require: "./cjs/index.cjs",
					types: "./types/index.d.ts",
				},
			},
			name: "test",
			version: "0.0.1",
		};
		let text: string | undefined;
		writeJson("path/to/package.json", pkg, {
			silent: true,
			writeText: (filePath, json, config) => {
				expect(filePath).eq("path/to/package.json");
				expect(config?.silent).eq(true);
				text = json;
			},
		});
		expect(text, "export order").match(/"custom":[^}]+?"types":[^}]+?"import":[^}]+?"require":[^}]+?"default":/s);
		expect(text, "final newline").match(/\n$/);
	});
});

describe(writeText.name, () => {
	it("ensures a final newline unless told otherwise", () => {
		let written: string | undefined = undefined;
		writeText("file.log", "nothing", {
			silent: true,
			writeFileSync: (path, text) => {
				expect(path).eq("file.log");
				written = text;
			},
		});
		expect(written).eq("nothing\n");
		written = undefined;
		writeText("file.log", "nothing", {
			finalNewline: false,
			silent: true,
			writeFileSync: (path, text) => {
				expect(path).eq("file.log");
				written = text;
			},
		});
		expect(written).eq("nothing");
	});

	it("logs to console unless told otherwise", () => {
		let logged: string | undefined = undefined;
		writeText("file.log", "nothing", {
			consoleLog: (msg) => {
				logged = msg;
			},
			writeFileSync: () => void(0),
		});
		expect(logged).match(/file\.log/);
		logged = undefined;
		writeText("file.log", "nothing", {
			silent: true,
			writeFileSync: () => void(0),
		});
		expect(logged, "logged nothing").eq(undefined);
	});
});
