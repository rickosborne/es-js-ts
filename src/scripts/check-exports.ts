import { fileExists } from "@rickosborne/term";
import * as console from "node:console";
import { readdirSync, readFileSync } from "node:fs";
import * as process from "node:process";
import { getModuleNames } from "./shared/module-names.js";
import { fromSrc, packagesPlus } from "./shared/project-root.js";

let exitCode: number = 0;

for (const moduleName of getModuleNames()) {
	console.log(`📦 ${ moduleName }`);
	const moduleDir = packagesPlus(moduleName);
	const indexPath = packagesPlus(moduleName, "index.ts");
	if (fileExists(indexPath)) {
		const needFiles = new Set<string>(readdirSync(moduleDir, { encoding: "utf-8", recursive: true, withFileTypes: true })
			.filter((de) => de.isFile() && de.name.endsWith(".ts") && de.name !== "index.ts" && !de.name.endsWith(".test.ts") && !de.name.endsWith(".test-d.ts") && !de.parentPath.includes("/__test__") && !de.parentPath.includes("/test-d"))
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
			console.log(`   ✅ Looks okay: ${ fromSrc(indexPath) }`);
		}
	} else {
		console.error(`   ⚠️ Missing file: ${ fromSrc(indexPath) }`);
		exitCode = 1;
	}
}

if (exitCode === 0) {
	console.log(`✅ All okay`);
} else {
	console.error(`⚠️ Problems encountered.`);
}

process.exit(exitCode);
