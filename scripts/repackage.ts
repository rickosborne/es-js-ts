import * as console from "node:console";
import * as fs from "node:fs";
import * as process from "node:process";
// noinspection ES6PreferShortImport
// noinspection ES6PreferShortImport
import { hasOwn } from "../guard/ts/has-own.js";
import { isDryRun } from "./shared/dry-run.js";
import { getModuleNames } from "./shared/module-names.js";
import { fromRoot, projectRoot, rootPlus } from "./shared/project-root.js";
import { DEPENDENCIES_KEYS, readPackageJson } from "./shared/read-file.js";
import { writePackageJson } from "./shared/write-package-json.js";

const moduleNames = getModuleNames();
const inheritDependencies = process.argv.slice(2).includes("--inherit-dependencies");

const rootPackage = readPackageJson(projectRoot);
const rewrites: (() => void)[] = [];

for (const moduleName of moduleNames) {
	const pkg = readPackageJson(rootPlus(moduleName, "package.json"));
	if (!hasOwn(pkg.scripts ?? {}, "pub")) continue;
	const distDir = rootPlus(moduleName, "dist");
	const distPackagePath = rootPlus(moduleName, "dist", "package.json");
	console.log(`📦 ${ moduleName } => ${ fromRoot(distPackagePath) }`);
	fs.mkdirSync(distDir, { recursive: true });
	const errors: string[] = [];
	if (inheritDependencies) {
		for (const depKey of DEPENDENCIES_KEYS) {
			const rootDeps = rootPackage[ depKey ];
			if (rootDeps == null) continue;
			let target: Record<string, string> | undefined = pkg[ depKey ];
			if (target == null) {
				target = {};
				pkg[ depKey ] = target;
			}
			for (const [ name, rootVersion ] of Object.entries(rootDeps)) {
				const moduleVersion = target[ name ];
				if (moduleVersion == null) {
					target[ name ] = rootVersion;
				} else if (rootVersion != moduleVersion) {
					errors.push(`   In ${ depKey }: ${ name } has version ${ moduleVersion } versus root ${ rootVersion }`);
				}
			}
		}
	}
	delete pkg.devDependencies;
	delete pkg.files;
	delete pkg.scripts;
	if (errors.length === 0) {
		console.log("   ✅ Looks okay.");
		rewrites.push(() => {
			writePackageJson(pkg, distPackagePath, (json) => json.replace(/("|\.\/)dist\//g, "$1"));
		});
	} else {
		console.error(`   ‼️ Problems:\n${ errors.join("\n   ") }`);
	}
}

if (rewrites.length === 0) {
	console.warn(`⚠️ Nothing to do.`);
} else if (isDryRun) {
	console.log(`🌵 Dry run.  Would have done ${ rewrites.length } rewrite(s).`);
} else {
	rewrites.forEach((runnable) => runnable());
}
