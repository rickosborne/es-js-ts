import * as path from "node:path";

export const repoRoot = path.join(__dirname, "..", "..", "..");
export const buildRoot = path.join(repoRoot, "build");
export const distRoot = path.join(repoRoot, "dist");
export const srcRoot = path.join(repoRoot, "src");
export const staticRoot = path.join(repoRoot, "static");
export const packagesRoot = path.join(srcRoot, "packages");
export const projectNamespace = "@rickosborne/";
export const packageTemplate = "package-template.json";

export const withNamespace = (moduleName: string): string => moduleName.startsWith(projectNamespace) ? moduleName : projectNamespace.concat(moduleName);

export const withoutNamespace = (packageName: string): string => packageName.startsWith(projectNamespace) ? packageName.substring(projectNamespace.length) : packageName;

export const fromDist = (fullPath: string) => path.relative(distRoot, fullPath);

export const fromSrc = (fullPath: string) => path.relative(srcRoot, fullPath);

export const buildPlus = (...pathParts: string[]) => path.resolve(buildRoot, ...pathParts);

export const distPlus = (...pathParts: string[]) => path.resolve(distRoot, ...pathParts);

export const srcPlus = (...pathParts: string[]) => path.resolve(srcRoot, ...pathParts);

export const staticPlus = (...pathParts: string[]) => path.resolve(staticRoot, ...pathParts);

export const packagesPlus = (...pathParts: string[]) => path.resolve(packagesRoot, ...pathParts);

export const repoPlus = (...pathParts: string[]) => path.join(repoRoot, ...pathParts);
