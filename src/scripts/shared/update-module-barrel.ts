import { readFile, writeText } from "@rickosborne/term";
import * as console from "node:console";
import { readdirSync } from "node:fs";
import { packagesPlus } from "./project-root.js";

export function updateModuleBarrel(moduleName: string): void {
	const indexPath = packagesPlus(moduleName, "index.ts");
	const existingText = readFile(indexPath);
	const indexText = readdirSync(packagesPlus(moduleName), { encoding: "utf-8", recursive: false, withFileTypes: true })
		.filter((de) => de.isFile() && de.name.endsWith(".ts") && de.name !== "index.ts" && !de.name.endsWith(".test.ts") && !de.name.endsWith(".test-d.ts") && !de.name.endsWith(".d.ts"))
		.map((de) => de.name)
		.sort()
		.map((name) => `export * from "./${ name.replace(/\.ts$/, ".js") }";`)
		.join("\n")
		.concat("\n");
	if (existingText === indexText) {
		console.log(`   🛢️ Barrel is up to date.`);
	} else {
		writeText(indexPath, indexText);
	}
}
