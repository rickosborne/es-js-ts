import { readFileSync } from "node:fs";

export const readFile = (path: string) => readFileSync(path, { encoding: "utf-8" });

export const readJson = <T>(path: string) => JSON.parse(readFile(path)) as T;

export type PackageJsonLike = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	name: string;
	scripts?: Record<string, string>;
}

export const readPackageJson = (pathOrModuleName: string) => {
	let path = pathOrModuleName;
	if (!path.endsWith("/package.json")) {
		path = path.replace(/\/$/, "").concat("/package.json");
	}
	return readJson<PackageJsonLike>(path);
};
