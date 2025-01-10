import { isDryRun, readPackageJson } from "@rickosborne/term";
import type { Runnable } from "@rickosborne/typical";
import * as console from "node:console";
import * as process from "node:process";
import { getModulePackages } from "./shared/module-names.js";
import { srcRoot } from "./shared/project-root.js";
import { repackageModule } from "./shared/repackage-module.js";

const inheritDependencies = process.argv.slice(2).includes("--inherit-dependencies");

const rootPackage = readPackageJson(srcRoot);
const rewrites: Runnable[] = [];

for (const { moduleName, modulePackage } of getModulePackages()) {
	repackageModule(moduleName, modulePackage, rootPackage, {
		inheritDependencies,
	});
}

if (rewrites.length === 0) {
	console.warn(`⚠️ Nothing to do.`);
} else if (isDryRun) {
	console.log(`🌵 Dry run.  Would have done ${ rewrites.length } rewrite(s).`);
} else {
	rewrites.forEach((runnable) => runnable());
}
