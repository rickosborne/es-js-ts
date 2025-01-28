import { DEPENDENCIES_KEYS, fileExists, type PackageJsonLike, positionalArgs, readPackageJson } from "@rickosborne/term";
import type { Comparator } from "@rickosborne/typical";
import { A_GT_B, A_LT_B } from "@rickosborne/typical";
import { type Dirent, readdirSync } from "node:fs";
import { argv } from "node:process";
import { packagesPlus, packagesRoot, packageTemplate, projectNamespace, withoutNamespace } from "./project-root.js";

export interface GetModuleNamesConfig {
	args?: string[];
	dirEntPredicate?: (de: Dirent) => boolean,
	rootDir?: string;
}

export const getModuleNames = (
	config: GetModuleNamesConfig = {},
): string[] => {
	const args = config.args ?? argv.slice(2);
	const rootDir = config.rootDir ?? packagesRoot;
	const dirEntPredicate = config.dirEntPredicate ?? (() => true);
	let moduleNames: string[];
	const positionals = positionalArgs(args);
	if (positionals.length === 0) {
		moduleNames = readdirSync(rootDir, { encoding: "utf-8", withFileTypes: true })
			.filter((de) => de.isDirectory() && !de.name.startsWith(".") && fileExists(de.parentPath, de.name, packageTemplate) && dirEntPredicate(de))
			.map((de) => de.name)
			.sort();
	} else {
		moduleNames = positionals.sort();
	}
	return moduleNames;
};

export interface ModulePackage {
	moduleName: string;
	modulePackage: PackageJsonLike;
}

export interface ModulePackageWithDependencies extends ModulePackage {
	dependsOn?: ModulePackageWithDependencies[];
}

export const moduleDependsOn = (depending: ModulePackageWithDependencies, dependency: ModulePackageWithDependencies): boolean => {
	if (depending.dependsOn == null || depending === dependency) {
		return false;
	}
	if (depending.dependsOn.includes(dependency)) {
		return true;
	}
	return depending.dependsOn.some((d) => moduleDependsOn(d, dependency));
};

export const moduleDependencyCount = (mod: ModulePackageWithDependencies): number => {
	const allDeps = new Set<ModulePackageWithDependencies>();
	const recurse = (m: ModulePackageWithDependencies): void => {
		if (allDeps.has(m)) return;
		allDeps.add(m);
		m.dependsOn?.forEach((d) => recurse(d));
	};
	recurse(mod);
	return allDeps.size - 1;
};

export const moduleBuildOrder: Comparator<ModulePackageWithDependencies> = (a, b) => {
	if (moduleDependsOn(a, b)) {
		return A_GT_B;
	}
	if (moduleDependsOn(b, a)) {
		return A_LT_B;
	}
	return moduleDependencyCount(a) - moduleDependencyCount(b);
};

export interface GetModulePackagesConfig extends GetModuleNamesConfig {
	sortBy?: Comparator<ModulePackageWithDependencies>;
}

export const getModulePackages = (
	config: GetModulePackagesConfig = {},
): ModulePackageWithDependencies[] => {
	const modulePackages: ModulePackageWithDependencies[] = getModuleNames(config)
		.map((moduleName) => ({
			moduleName,
			modulePackage: readPackageJson(packagesPlus(moduleName, packageTemplate)),
			dependsOn: [],
		}));
	for (const modulePackage of modulePackages) {
		for (const depsKey of DEPENDENCIES_KEYS) {
			const deps = modulePackage.modulePackage[depsKey] ?? {};
			for (const depName of Object.keys(deps)) {
				if (depName.startsWith(projectNamespace)) {
					const name = withoutNamespace(depName);
					const dep = modulePackages.find((mp) => mp.moduleName === name);
					if (dep == null) {
						throw new Error(`Could not find ${depName}, dependency of ${modulePackage.moduleName}`);
					}
					modulePackage.dependsOn ??= [];
					if (!(modulePackage.dependsOn.includes(dep))) {
						modulePackage.dependsOn.push(dep);
					}
				}
			}
		}
	}
	const comparator = config.sortBy ?? moduleBuildOrder;
	modulePackages.sort(comparator);
	return modulePackages;
};
