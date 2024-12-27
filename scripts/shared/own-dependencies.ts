import { SemVer } from "semver";
import { projectNamespace } from "./project-root.js";

/**
 * The version will be null if the dependency uses a `file:` link.
 */
export const ownDependencies = (
	...deps: (Record<string, string> | undefined)[]
): Map<string, SemVer | null> => {
	const map = new Map<string, SemVer | null>();
	for (const dep of deps) {
		if (dep == null) {
			continue;
		}
		for (const [ name, version ] of Object.entries(dep)) {
			if (name.startsWith(projectNamespace)) {
				map.set(name, version.startsWith("file:") ? null : new SemVer(version));
			}
		}
	}
	return map;
};
