import { hasOwn } from "@rickosborne/guard";
import type { Runnable } from "@rickosborne/typical";
import * as console from "node:console";
import * as fs from "node:fs";
import * as process from "node:process";
import { isDryRun } from "./shared/dry-run.js";
import { getModuleNames } from "./shared/module-names.js";
import { fromRoot, projectNamespace, projectRoot, rootPlus } from "./shared/project-root.js";
import { DEPENDENCIES_KEYS, readPackageJson } from "./shared/read-file.js";
import { writePackageJson } from "./shared/write-package-json.js";

const moduleNames = getModuleNames();
const inheritDependencies = process.argv.slice(2).includes("--inherit-dependencies");

const rootPackage = readPackageJson(projectRoot);
const rewrites: Runnable[] = [];

for (const moduleName of moduleNames) {
	const pkg = readPackageJson(rootPlus(moduleName, "package.json"));
	if (!hasOwn(pkg.scripts ?? {}, "pub")) continue;
	const distDir = rootPlus(moduleName, "dist");
	const distPackagePath = rootPlus(moduleName, "dist", "package.json");
	console.log(`📦 ${ moduleName } => ${ fromRoot(distPackagePath) }`);
	fs.mkdirSync(distDir, { recursive: true });
	const errors: string[] = [];
	for (const depKey of DEPENDENCIES_KEYS) {
		let target: Record<string, string> | undefined = pkg[ depKey ];
		if (target == null && !inheritDependencies) {
			continue;
		}
		if (target != null) {
			for (const [ name, version ] of Object.entries(target)) {
				if (name.startsWith(projectNamespace) && version.startsWith("file:../")) {
					target[ name ] = rootPackage.version;
				}
			}
		} else {
			target = {};
			pkg[ depKey ] = target;
		}
		if (inheritDependencies) {
			const rootDeps = rootPackage[ depKey ];
			if (rootDeps != null) {
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
	}
	delete pkg.devDependencies;
	delete pkg.files;
	delete pkg.scripts;
	pkg.main = "cjs/index.js";
	pkg.module = "esm/index.js";
	pkg.name = projectNamespace.concat(moduleName);
	pkg.private = false;
	pkg.publishConfig = { access: "public" };
	pkg.readme = "README.md";
	pkg.types = "types/index.d.ts";
	pkg.typings = "types/index.d.ts";
	pkg.exports = {
		".": {
			types: "./types/index.d.ts",
			import: "./esm/index.js",
			require: "./cjs/index.js",
			default: "./esm/index.js",
		},
	};
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
