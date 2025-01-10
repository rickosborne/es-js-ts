import type { PackageJsonLike } from "@rickosborne/term";
import { DEPENDENCIES_KEYS, isDryRun, writeJson } from "@rickosborne/term";
import * as console from "node:console";
import * as fs from "node:fs";
import { readdirSync } from "node:fs";
import { deepCopy } from "../../packages/foundation/deep-copy.js";
import { distPlus, projectNamespace } from "./project-root.js";

export type RepackageModuleOptions = {
	dryRun?: boolean;
	inheritDependencies?: boolean;
}

export function repackageModule(
	moduleName: string,
	modulePackage: PackageJsonLike,
	rootPackage: PackageJsonLike,
	options: RepackageModuleOptions = {},
): void {
	const inheritDependencies = options.inheritDependencies ?? false;
	const dryRun = options.dryRun ?? isDryRun;
	const distDir = distPlus(moduleName);
	const distPackagePath = distPlus(moduleName, "package.json");
	const pkg = deepCopy(modulePackage);
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
	pkg.main = "./index.cjs";
	pkg.module = "./index.mjs";
	pkg.name = projectNamespace.concat(moduleName);
	pkg.private = false;
	pkg.publishConfig = { access: "public" };
	pkg.readme = "README.md";
	pkg.types = "./index.d.ts";
	pkg.typings = "./index.d.ts";
	pkg.exports = {
		".": {
			types: "./index.d.ts",
			import: "./index.mjs",
			require: "./index.cjs",
			default: "./index.mjs",
		},
		"./*.js": {
			types: "./*.d.ts",
			import: "./*.mjs",
			require: "./*.cjs",
			default: "./*.mjs",
		},
	};
	const sources = readdirSync(distPlus(moduleName), { encoding: "utf-8", withFileTypes: true })
		.filter((de) => de.isFile() && (de.name.endsWith(".d.ts") || de.name.endsWith(".mjs") || de.name.endsWith(".cjs")) && !de.name.startsWith("index."))
		.map((de) => de.name);
	for (const sourceFileName of sources) {
		const [ sourceName, ext ] = sourceFileName.split(".", 2) as [ string, string ];
		const subPath = "./".concat(sourceName);
		pkg.exports[ subPath ] ??= {};
		const targetExports = pkg.exports[ subPath ];
		const filePath = "./".concat(sourceFileName);
		if (ext === "d") {
			targetExports.types = filePath;
		} else if (ext === "mjs") {
			targetExports.import = filePath;
			targetExports.default = filePath;
		} else if (ext === "cjs") {
			targetExports.require = filePath;
		}
	}
	if (errors.length === 0) {
		if (dryRun) {
			console.log(`   ✅ Package for ${ moduleName } looks okay.`);
		} else {
			console.log(`   🗜️ Packaged ${ moduleName }`);
			writeJson(distPackagePath, pkg, { modifyJson: (json) => json.replace(/("|\.\/)dist\//g, "$1") });
		}
	} else {
		console.error(`   ‼️ Problems:\n${ errors.join("\n   ") }`);
	}
}
