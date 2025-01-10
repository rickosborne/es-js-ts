import type { PackageJsonLike } from "@rickosborne/term";
import { DEPENDENCIES_KEYS, isDryRun, readPackageJson, writeJson } from "@rickosborne/term";
import { execSync } from "node:child_process";
import * as console from "node:console";
import { SemVer } from "semver";
import { getModulePackages } from "./shared/module-names.js";
import { ownDependencies } from "./shared/own-dependencies.js";
import { packagesPlus, packageTemplate, srcPlus, withNamespace } from "./shared/project-root.js";

const versionForModule = new Map<string, SemVer>();
const dependenciesForModule = new Map<string, Map<string, SemVer | null>>();
const packageForModule = new Map<string, PackageJsonLike>();

const now = new Date();
const year = now.getFullYear();
const month = 1 + now.getMonth();
const day = now.getDate();
const preferred = new SemVer(`${ year }.${ month }.${ day }`);
let sharedVersion = new SemVer("0.0.0");
const moduleNames: string[] = [];

for (const { moduleName, modulePackage: pkg } of getModulePackages()) {
	moduleNames.push(moduleName);
	packageForModule.set(moduleName, pkg);
	const packageName = pkg.name;
	if (packageName !== withNamespace(moduleName)) {
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
}

console.log(`⌚️ Latest of modules: ${ sharedVersion.toString() }`);
sharedVersion = new SemVer(sharedVersion.toString()).inc("patch");
if (preferred.compare(sharedVersion) > 0) {
	sharedVersion = preferred;
}
const bumped = sharedVersion.toString();

console.log(`🔼 Updated: ${ bumped }`);
const updatedModules: string[] = [];

for (const moduleName of moduleNames) {
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
			if (version != null && version.toString() !== bumped) {
				target[ packageName ] = bumped;
				anyBumps = true;
			}
		}
	});
	if (anyBumps) {
		updatedModules.push(moduleName);
	}
}

if (updatedModules.length === 0) {
	console.log(`✅ No bumps required.`);
} else {
	console.log(`👊 Bumps: ${ updatedModules.join(" ") }`);
	if (isDryRun) {
		console.log(`🌵 Dry run.  Will not save changes.`);
	} else {
		for (const moduleName of updatedModules) {
			const pkg = packageForModule.get(moduleName);
			if (pkg == null) {
				throw new Error(`No package: ${ moduleName }`);
			}
			const filePath = packagesPlus(moduleName, packageTemplate);
			writeJson(filePath, pkg);
		}
		const rootPkgPath = srcPlus("package.json");
		const rootPkg = readPackageJson(rootPkgPath);
		rootPkg.version = bumped;
		writeJson(rootPkgPath, rootPkg);
		execSync("npm install", { encoding: "utf-8", stdio: "inherit" });
		console.log(`🏷️ Tagging as v${ bumped }`);
		execSync(`git commit -a -m "v${ bumped }"`, { encoding: "utf-8", stdio: "inherit" });
		execSync(`git tag -s -m "v${ bumped }" "v${ bumped }"`, { encoding: "utf-8", stdio: "inherit" });
	}
}
