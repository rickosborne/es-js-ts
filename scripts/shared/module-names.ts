import { readdirSync } from "node:fs";
import * as process from "node:process";
import { dirExists } from "./dir-exists.js";
import { fileExists } from "./file-exists.js";
import * as path from "node:path";
import { positionalArgs } from "./positionals.js";

export const getModuleNames = (
	args: string[] = process.argv.slice(2),
	rootDir: string = path.resolve(__dirname, "..", ".."),
): string[] => {
	let moduleNames: string[];
	const positionals = positionalArgs(args);
	if (positionals.length === 0) {
		moduleNames = readdirSync(rootDir, { encoding: "utf-8", withFileTypes: true })
			.filter((de) => de.isDirectory() && !de.name.startsWith(".") && fileExists(de.name, "package.json") && dirExists(de.name, "ts"))
			.map((de) => de.name)
			.sort();
	} else {
		moduleNames = positionals.sort();
	}
	return moduleNames;
};
