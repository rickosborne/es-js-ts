import * as console from "node:console";
import { readFileSync, readdirSync } from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { fileExists } from "./shared/file-exists.js";
import { getModuleNames } from "./shared/module-names.js";
import { fromRoot, projectRoot } from "./shared/project-root.js";

const moduleNames = getModuleNames();

let exitCode: number = 0;

moduleNames.forEach((moduleName) => {
	console.log(`📦 ${ moduleName }`);
	const tsDir = path.join(projectRoot, moduleName, "ts");
	const indexPath = path.join(projectRoot, moduleName, "index.ts");
	if (fileExists(indexPath)) {
		const needFiles = new Set<string>(readdirSync(tsDir, { encoding: "utf-8", recursive: true, withFileTypes: true })
			.filter((de) => de.isFile() && de.name.endsWith(".ts") && de.name !== "index.ts" && !de.name.endsWith(".test.ts") && !de.parentPath.includes("/__test__"))
			.map((de) => de.name.replace(/\.ts$/, "")));
		console.log(`   Files: ${ needFiles.size }`);
		readFileSync(indexPath, { encoding: "utf-8" })
			.split("\n")
			.map((line) => {
				const match = /^export \* from "\.\/ts\/([^"]+?)(?:\.js)?"/.exec(line);
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
				console.error(`   ⚠️ Missing: export * from "./ts/${ name }.js"`);
			});
		} else {
			console.log(`   ✅ Looks okay: ${ fromRoot(indexPath) }`);
		}
	} else {
		console.error(`   ⚠️ Missing file: ${ fromRoot(indexPath) }`);
		exitCode = 1;
	}
});

if (exitCode === 0) {
	console.log(`✅ All okay`);
} else {
	console.error(`⚠️ Problems encountered.`);
}

process.exit(exitCode);
