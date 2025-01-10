import { copyRecursiveSync, DEPENDENCIES_KEYS, readPackageJson, writeJson } from "@rickosborne/term";
import * as childProcess from "node:child_process";
import * as console from "node:console";
import * as path from "node:path";
import { rimraf } from "rimraf";
import { distRoot, projectNamespace, repoRoot } from "./shared/project-root.js";

const integrationRoot = path.join(repoRoot, "integration");
const packageFiles: string[] = [];

rimraf.sync(integrationRoot, { preserveRoot: true });

copyRecursiveSync(distRoot, integrationRoot, {
	onCopy(_source: unknown, destination: string) {
		const fromDest = path.relative(integrationRoot, destination);
		if (fromDest.endsWith("/package.json")) {
			packageFiles.push(fromDest);
			console.log(fromDest);
		}
	},
	verbose: false,
});

const packageDirs: string[] = [];

for (const packageFileRelative of packageFiles) {
	console.log(`🔀 Rewiring ${packageFileRelative}`);
	const packageFilePath = path.join(integrationRoot, packageFileRelative);
	packageDirs.push(path.dirname(packageFilePath));
	const pkg = readPackageJson(packageFilePath);
	let changed = false;
	for (const depKey of DEPENDENCIES_KEYS) {
		const target = pkg[depKey] ?? {};
		for (const name of Object.keys(target)) {
			if (name.startsWith(projectNamespace)) {
				target[name] = "file:../".concat(name.replace(projectNamespace, ""));
				changed = true;
			}
		}
	}
	if (changed) {
		writeJson(packageFilePath, pkg);
	}
}

for (const packageDir of packageDirs) {
	console.log(`⚡️ Install: ${path.relative(integrationRoot, packageDir)}`);
	childProcess.execSync("npm install", {
		cwd: packageDir,
		stdio: "inherit",
	});
}
