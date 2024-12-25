import * as path from "node:path";

export const projectRoot = path.join(__dirname, "..", "..");

export const projectNamespace = "@rickosborne/";

export const withNamespace = (moduleName: string): string => moduleName.startsWith(projectNamespace) ? moduleName : projectNamespace.concat(moduleName);

export const withoutNamespace = (packageName: string): string => packageName.startsWith(projectNamespace) ? packageName.substring(projectNamespace.length) : packageName;

export const fromRoot = (fullPath: string) => path.relative(projectRoot, fullPath);
