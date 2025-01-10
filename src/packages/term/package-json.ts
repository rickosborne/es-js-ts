import * as path from "node:path";
import { hasPlainObject, isPlainObject } from "@rickosborne/guard";
import { readJson } from "./read-file.js";

/**
 * Oversimplified <kbd>package.json</kbd> type definition.  Doesn't
 * have absolutely everything, and is more of a "reasonable default"
 * view.
 */
export type PackageJsonLike = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
	exports?: {
		[ key: string ]: {
			default?: string;
			import?: string;
			require?: string;
			types?: string;
		} & Record<string, string>;
	};
	files?: string[];
	main?: string;
	module?: string;
	name: string;
	peerDependencies?: Record<string, string>;
	private?: boolean;
	publishConfig?: {
		access: "public";
	};
	readme?: string;
	scripts?: Record<string, string>;
	types?: string;
	typings?: string;
	version: string;
}

/**
 * Property names for the parts of a <kbd>package.json</kbd> which
 * may include dependency information.
 */
export const DEPENDENCIES_KEYS = [ "dependencies", "devDependencies", "peerDependencies" ] as const;

/**
 * Ensure the given path points to a <kbd>package.json</kbd> file and not
 * just a directory.
 */
export const pathWithPackageJson = (...parts: string[]): string => {
	const fullPath = path.join(...parts);
	if (fullPath.endsWith(".json")) {
		return fullPath;
	}
	return fullPath.replace(/\/$/, "").concat("/package.json");
};

/**
 * Read a <kbd>package.json</kbd> from the given path, returning it
 * as structured data instead of just text.
 */
export const readPackageJson = (pathOrModuleName: string): PackageJsonLike => {
	return readJson<PackageJsonLike>(pathWithPackageJson(pathOrModuleName));
};

/**
 * Reasonable order for the keys of a <kbd>package.json</kbd>'s <kbd>exports</kbd> map.
 */
export const EXPORTS_ORDER = Object.freeze([ "types", "import", "require", "default" ] as const);

/**
 * Comparator for the keys of a <kbd>package.json</kbd>'s <kbd>exports</kbd> map,
 * to ensure they are serialized in the correct order.
 */
export const compareExportsKeys = (a: string, b: string): number => {
	const aIndex = (EXPORTS_ORDER as readonly string[]).indexOf(a);
	const bIndex = (EXPORTS_ORDER as readonly string[]).indexOf(b);
	return aIndex - bIndex;
};

/**
 * Given a <kbd>package.json</kbd>'s <kbd>exports</kbd> map, generate a
 * version which should serialize in the correct order.
 */
export const remapExports = <R extends Record<string, string>>(exports: R): R => {
	const sortedKeys: (string & keyof R)[] = Object.keys(exports).slice().sort(compareExportsKeys);
	const record = {} as R;
	for (const key of sortedKeys) {
		record[ key ] = exports[ key ];
	}
	return new Proxy<R>(record, {
		ownKeys(): ArrayLike<string | symbol> {
			return sortedKeys;
		},
	});
};

/**
 * Mangle a <kbd>package.json</kbd> structure to make it serialize properly.
 */
export const preparePackageJsonForSerialization = (
	pkg: PackageJsonLike,
): PackageJsonLike => {
	if (hasPlainObject(pkg, "exports")) {
		// These need to be in a particular order, because someone is a monster.
		for (const [ key, exports ] of Object.entries(pkg.exports)) {
			if (isPlainObject(exports)) {
				pkg.exports[ key ] = remapExports(exports);
			}
		}
	}
	return pkg;
};
