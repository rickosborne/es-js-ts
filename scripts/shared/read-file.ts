import { readFileSync } from "node:fs";

export const readFile = (path: string) => readFileSync(path, { encoding: "utf-8" });

export const readJson = <T>(path: string) => JSON.parse(readFile(path)) as T;

export type PackageJsonLike = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	exports?: Record<string, Record<string, string>>;
	files?: string[];
	main?: string;
	name: string;
	peerDependencies?: Record<string, string>;
	scripts?: Record<string, string>;
	types?: string;
	typings?: string;
	version: string;
}

export const DEPENDENCIES_KEYS = [ "dependencies", "devDependencies", "peerDependencies" ] as const;

export const readPackageJson = (pathOrModuleName: string) => {
	let path = pathOrModuleName;
	if (!path.endsWith("/package.json")) {
		path = path.replace(/\/$/, "").concat("/package.json");
	}
	return readJson<PackageJsonLike>(path);
};
