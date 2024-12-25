import { SemVer } from "semver";
import { isDryRun } from "./shared/dry-run.js";
import { getModuleNames } from "./shared/module-names.js";
import { ownDependencies } from "./shared/own-dependencies.js";
import { fromRoot, projectNamespace, projectRoot } from "./shared/project-root.js";
import { DEPENDENCIES_KEYS, type PackageJsonLike, readPackageJson } from "./shared/read-file.js";
import * as fs from "node:fs";
import * as path from "node:path";

const moduleNames = getModuleNames();
const versionForModule = new Map<string, SemVer>();
const dependenciesForModule = new Map<string, Map<string, SemVer>>();
const packageForModule = new Map<string, PackageJsonLike>();

const now = new Date();
const year = now.getFullYear();
const month = 1 + now.getMonth();
const day = now.getDate();
const preferred = new SemVer(`${ year }.${ month }.${ day }`);
let sharedVersion = new SemVer("0.0.0");

if (moduleNames.length === 0) {
	console.error(`No modules?`);
	process.exit(1);
}

moduleNames.forEach((moduleName) => {
	const pkg = readPackageJson(path.join(projectRoot, moduleName));
	packageForModule.set(moduleName, pkg);
	const packageName = pkg.name;
	if (packageName !== projectNamespace.concat(moduleName)) {
		throw new Error(`Bad package name of ${ moduleName }: ${ packageName }`);
	}
	const version = new SemVer(pkg.version);
	versionForModule.set(moduleName, version);
	if (version.compare(sharedVersion) > 0) {
		sharedVersion = version;
	}
	console.log(`📦 ${ moduleName }: ${ version.toString() }`);
	const deps = ownDependencies(pkg.devDependencies, pkg.dependencies, pkg.peerDependencies);
	dependenciesForModule.set(moduleName, deps);
});
console.log(`⌚️ Latest of modules: ${sharedVersion.toString()}`);
sharedVersion = new SemVer(sharedVersion.toString()).inc("patch");
if (preferred.compare(sharedVersion) > 0) {
	sharedVersion = preferred;
}
const bumped = sharedVersion.toString();

console.log(`🔼 Updated: ${ bumped }`);
const updatedModules: string[] = [];

moduleNames.forEach((moduleName) => {
	const deps = dependenciesForModule.get(moduleName)!;
	const pkg = packageForModule.get(moduleName)!;
	const version = versionForModule.get(moduleName)!;
	let anyBumps = false;
	if (version.compare(bumped) < 0) {
		pkg.version = bumped.toString();
		anyBumps = true;
	}
	deps.forEach((version, packageName) => {
		let target: Record<string, string> | undefined = undefined;
		for (const key of DEPENDENCIES_KEYS) {
			if (pkg[ key ] != null && packageName in pkg[ key ]) {
				target = pkg[ key ];
			}
			if (target == null) {
				throw new Error(`Cannot find dependency ${ packageName } in ${ moduleName }package.json`);
			}
			if (version.toString() !== bumped) {
				target[ packageName ] = bumped;
				anyBumps = true;
			}
		}
	});
	if (anyBumps) {
		updatedModules.push(moduleName);
	}
});

if (updatedModules.length === 0) {
	console.log(`✅ No bumps required.`);
} else {
	console.log(`👊 Bumps: ${updatedModules.join(" ")}`);
	if (isDryRun) {
		console.log(`🌵 Dry run.  Will not save changes.`);
	} else {
		for (const moduleName of updatedModules) {
			const pkg = packageForModule.get(moduleName);
			if (pkg == null) {
				throw new Error(`No package: ${ moduleName }`);
			}
			const json = JSON.stringify(pkg, undefined, "\t").concat("\n");
			const filePath = path.join(projectRoot, moduleName, "package.json");
			console.log(`✏️ Update ${fromRoot(filePath)}`);
			fs.writeFileSync(filePath, json, { encoding: "utf-8" });
		}
	}
}