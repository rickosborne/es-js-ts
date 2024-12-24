import * as console from "node:console";
import { readFileSync, readdirSync } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { dirExists } from "./shared/dir-exists.js";
import { fileExists } from "./shared/file-exists.js";

const args = process.argv.slice(2);

let moduleNames: string[];
if (args.length === 0) {
	moduleNames = readdirSync(".", { encoding: "utf-8", withFileTypes: true })
		.filter((de) => de.isDirectory() && !de.name.startsWith(".") && fileExists(de.name, "package.json") && dirExists(de.name, "ts"))
		.map((de) => de.name)
		.sort();
} else {
	moduleNames = args;
}

let exitCode: number = 0;

const rootDir = path.resolve(__dirname, "..");

moduleNames.forEach((moduleName) => {
	console.log(`📦 ${ moduleName }`);
	const tsDir = path.join(rootDir, moduleName, "ts");
	const indexPath = path.join(tsDir, "index.ts");
	if (fileExists(indexPath)) {
		const needFiles = new Set<string>(readdirSync(tsDir, { encoding: "utf-8", recursive: true, withFileTypes: true })
			.filter((de) => de.isFile() && de.name.endsWith(".ts") && de.name !== "index.ts" && !de.name.endsWith(".test.ts"))
			.map((de) => de.name.replace(/\.ts$/, "")));
		console.log(`   Files: ${ needFiles.size }`);
		readFileSync(indexPath, { encoding: "utf-8" })
			.split("\n")
			.map((line) => {
				const match = /^export \* from "\.\/([^"]+?)(?:\.js)?"/.exec(line);
				if (match?.[ 1 ] != null) {
					return match[ 1 ];
				}
				return undefined;
			})
			.filter((name) => name != null)
			.forEach((name) => {
				needFiles.delete(name);
			});
		if (needFiles.size > 0) {
			exitCode = 1;
			needFiles.forEach((name) => {
				console.error(`   ⚠️ Missing export: export * from "./${ name }.js"`);
			});
		} else {
			console.log(`   ✅ Looks okay: ${ path.relative(rootDir, indexPath) }`);
		}
	} else {
		console.error(`   ⚠️ Missing file: ${ path.relative(rootDir, indexPath) }`);
		exitCode = 1;
	}
});

if (exitCode === 0) {
	console.log(`✅ All okay`);
} else {
	console.error(`⚠️ Problems encountered.`);
}

process.exit(exitCode);
