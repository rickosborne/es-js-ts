import { execSync } from "node:child_process";
import * as console from "node:console";
import * as path from "node:path";
import * as process from "node:process";
import { getModuleNames } from "./shared/module-names.js";
import { projectNamespace, projectRoot, withoutNamespace } from "./shared/project-root.js";
import { readPackageJson } from "./shared/read-file.js";

const args = process.argv.slice(2);

if (args.length < 1) {
	console.error(`Usage: tsx scripts/run-all.ts (command) [...args]`);
	process.exit(1);
}

const command = args.shift()!;

console.log(`⚡️ Run all: ${ command } ${ args.map((a) => JSON.stringify(a)).join(" ") }\n`);

type ModuleDecl = {
	deferCount: number;
	dependsOn: string[];
	moduleName: string;
	packageName: string;
}

const moduleNames = getModuleNames({ args });

const modules = moduleNames.map((moduleName): ModuleDecl | undefined => {
	const pkg = readPackageJson(moduleName);
	if (pkg.scripts?.[ command ] == null) {
		return undefined;
	}
	const dependsOn = Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.devDependencies ?? {}))
		.filter((name) => name.startsWith(projectNamespace) && withoutNamespace(name))
		.sort();
	// console.debug(`${moduleName} depends on: ${dependsOn.length === 0 ? "(nothing)" : dependsOn.map((name) => name.substring(namespacePrefix.length)).join(" ")}`);
	return { deferCount: 0, dependsOn, moduleName, packageName: pkg.name };
})
	.filter((decl) => decl != null);

if (modules.length === 0) {
	console.error(`No modules had a ${ JSON.stringify(command) } command`);
	process.exit(1);
}

const completed = new Set<string>();

// Super basic dependency reordering
modules.sort((a, b) => {
	if (a.dependsOn.includes(b.packageName)) {
		// console.debug(`${b.moduleName} ← ${a.moduleName}`);
		return 1;
	}
	if (b.dependsOn.includes(a.packageName)) {
		// console.debug(`${a.moduleName} ← ${b.moduleName}`);
		return -1;
	}
	// console.debug(`${a.moduleName} ?? ${b.moduleName}`);
	return 0;
});

while (modules.length > 0) {
	const mod = modules.shift()!;
	const stillNeeds = mod.dependsOn.filter((dep) => !completed.has(dep));
	if (stillNeeds.length > 0) {
		mod.deferCount++;
		if (mod.deferCount > 10) {
			throw new Error(`Cannot figure out how build ${ mod.moduleName } with: ${ mod.dependsOn.join(" ") }`);
		}
		console.debug(`⏲️ Deferring ${mod.moduleName} until after ${stillNeeds.join(" ")}`);
		modules.push(mod);
	} else {
		console.log(`📦 ${ mod.moduleName }`);
		execSync(`npm run ${ command } -- ${ args.map((a) => JSON.stringify(a)).join(" ") }`, {
			cwd: path.join(projectRoot, mod.moduleName),
			encoding: "utf-8",
			env: process.env,
			stdio: "inherit",
		});
		completed.add(mod.packageName);
	}
}
