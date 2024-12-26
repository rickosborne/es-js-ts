import * as console from "node:console";
import * as fs from "node:fs";
// noinspection ES6PreferShortImport
import { deepSort } from "../../foundation/ts/deep-sort.js";
import { fromRoot } from "./project-root.js";
import type { PackageJsonLike } from "./read-file.js";

export const writePackageJson = (
	pkg: PackageJsonLike,
	fullPath: string,
	modifyJson?: undefined | ((json: string) => string),
): void => {
	const sorted = deepSort(pkg);
	if (sorted.exports != null) {
		for (const [ key, exports ] of Object.entries(sorted.exports)) {
			const { types, import: imp, require: req, default: def } = exports;
			const dotExports: Record<string, string> = {};
			dotExports.types = types;
			dotExports.import = imp;
			dotExports.require = req;
			dotExports.default = def;
			sorted.exports[ key ] = dotExports;
		}
	}
	let json = JSON.stringify(sorted, undefined, "\t").concat("\n");
	if (modifyJson != null) {
		json = modifyJson(json);
	}
	console.log(`✏️ Write: ${ fromRoot(fullPath) }`);
	fs.writeFileSync(fullPath, json, { encoding: "utf-8" });
};
