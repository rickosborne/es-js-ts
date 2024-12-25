import { SemVer } from "semver";
import { projectNamespace } from "./project-root.js";

export const ownDependencies = (
	...deps: (Record<string, string> | undefined)[]
): Map<string, SemVer> => {
	const map = new Map<string, SemVer>();
	for (const dep of deps) {
		if (dep == null) {
			continue;
		}
		for (const [ name, version ] of Object.entries(dep)) {
			if (name.startsWith(projectNamespace)) {
				map.set(name, new SemVer(version));
			}
		}
	}
	return map;
};
