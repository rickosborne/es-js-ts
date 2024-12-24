import * as console from "node:console";
import { readdirSync } from "node:fs";
import * as path from "node:path";
import { fileExists } from "./shared/file-exists.js";
import { readPackageJson } from "./shared/read-file.js";
import { execSync } from "node:child_process";
import * as process from "node:process";

const rootDir = path.join(__dirname, "..");

type ModuleDecl = {
	deferCount: number;
	dependsOn: string[];
	moduleName: string;
	packageName: string;
}

const modules = readdirSync(rootDir, { encoding: "utf-8", withFileTypes: true })
	.filter((de) => de.isDirectory() && !de.name.startsWith(".") && fileExists(path.join(de.name, "package.json")))
	.map((de) => de.name)
	.map((moduleName): ModuleDecl | undefined => {
		const pkg = readPackageJson(moduleName);
		if (pkg.scripts?.build == null) {
			return undefined;
		}
		const dependsOn = Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.devDependencies ?? {}))
			.filter((name) => name.startsWith("@rickosborne/"))
			.sort();
		return { deferCount: 0, dependsOn, moduleName, packageName: pkg.name };
	})
	.filter((decl) => decl != null);

const completed = new Set<string>();

// Super basic dependency reordering
while (modules.length > 0) {
	const mod = modules.shift()!;
	const ready = mod.dependsOn.every((dep) => completed.has(dep));
	if (!ready) {
		mod.deferCount++;
		if (mod.deferCount > 10) {
			throw new Error(`Cannot figure out how build ${mod.moduleName} with: ${mod.dependsOn.join(" ")}`);
		}
		modules.push(mod);
	} else {
		console.log(`📦 ${ mod.moduleName }`);
		execSync("npm run build", {
			cwd: path.join(rootDir, mod.moduleName),
			encoding: "utf-8",
			env: process.env,
			stdio: "inherit",
		});
		completed.add(mod.packageName);
	}
}
