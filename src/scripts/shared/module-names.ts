import { DEPENDENCIES_KEYS, type PackageJsonLike, fileExists, positionalArgs, readPackageJson } from "@rickosborne/term";
import type { Comparator } from "@rickosborne/typical";
import { type Dirent, readdirSync } from "node:fs";
import * as process from "node:process";
import { packageTemplate, packagesPlus, packagesRoot } from "./project-root.js";

export interface GetModuleNamesConfig {
	args?: string[];
	dirEntPredicate?: (de: Dirent) => boolean,
	rootDir?: string;
}

export const getModuleNames = (
	config: GetModuleNamesConfig = {},
): string[] => {
	const args = config.args ?? process.argv.slice(2);
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

export type ModulePackage = {
	moduleName: string;
	modulePackage: PackageJsonLike
};

export const moduleBuildOrder: Comparator<ModulePackage> = (a, b) => {
	const aPackage = a.modulePackage;
	const bPackage = b.modulePackage;
	const aName = aPackage.name;
	const bName = bPackage.name;
	for (const key of DEPENDENCIES_KEYS) {
		const aDeps = aPackage[ key ] ?? {};
		const bDeps = bPackage[ key ] ?? {};
		if (aDeps[ bName ] != null) {
			return 1;
		}
		if (bDeps[ aName ] != null) {
			return -1;
		}
	}
	return 0;
};

export interface GetModulePackagesConfig extends GetModuleNamesConfig {
	sortBy?: Comparator<ModulePackage>;
}

export const getModulePackages = (
	config: GetModulePackagesConfig = {},
): ModulePackage[] => {
	const comparator = config.sortBy ?? moduleBuildOrder;
	return getModuleNames(config)
		.map((moduleName) => ({
			moduleName,
			modulePackage: readPackageJson(packagesPlus(moduleName, packageTemplate)),
		}))
		.sort(comparator);
};
