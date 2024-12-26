import { type Dirent, readdirSync } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { dirExists } from "./dir-exists.js";
import { fileExists } from "./file-exists.js";
import { positionalArgs } from "./positionals.js";

export type GetModuleNamesConfig = {
	args?: string[];
	dirEntPredicate?: (de: Dirent) => boolean,
	rootDir?: string;
}

export const getModuleNames = (
	config: GetModuleNamesConfig = {},
): string[] => {
	const args = config.args ?? process.argv.slice(2);
	const rootDir = config.rootDir ?? path.resolve(__dirname, "..", "..");
	const dirEntPredicate = config.dirEntPredicate ?? (() => true);
	let moduleNames: string[];
	const positionals = positionalArgs(args);
	if (positionals.length === 0) {
		moduleNames = readdirSync(rootDir, { encoding: "utf-8", withFileTypes: true })
			.filter((de) => de.isDirectory() && !de.name.startsWith(".") && fileExists(de.name, "package.json") && dirExists(de.name, "ts") && dirEntPredicate(de))
			.map((de) => de.name)
			.sort();
	} else {
		moduleNames = positionals.sort();
	}
	return moduleNames;
};
