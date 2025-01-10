import type { Comparator } from "@rickosborne/typical";
import * as console from "node:console";
import type { Dirent } from "node:fs";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join as pathJoin, relative } from "node:path";

/**
 * Options for {@link copyRecursiveSync}.
 */
export type CopyRecursiveOptions = {
	/**
	 * Override the implementation of the copy-file operation.
	 * Mostly used for unit tests.
	 */
	copyFileSync?: (source: string, destination: string) => void;
	/**
	 * If the filter function returns true, copy the item.
	 * @defaultValue {@link copyRecursiveFilterDefault}
	 */
	keepIf?: (dirEnt: Dirent) => boolean;
	/**
	 * Override the implementation of the console.log operation.
	 * Mostly used for unit tests.
	 */
	log?: (message: string) => void;
	/**
	 * Override the implementation of the make-directory operation.
	 * Mostly used for unit tests.
	 */
	mkdirSync?: (path: string, options: {recursive: true}) => void;
	/**
	 * Callback when a file or directory is copied, such as for logging.
	 */
	onCopy?: (sourceDirEnt: Dirent, destination: string) => void;
	/**
	 * Override the implementation of the read-directory operation.
	 * Mostly used for unit tests.
	 */
	readdirSync?: (path: string, options: { recursive: false, encoding: "utf8", withFileTypes: true }) => Dirent[];
	/**
	 * Override the order in which items are copied.
	 */
	sort?: Comparator<Dirent>;
	/**
	 * Whether to log out each file or directory as it is copied.
	 */
	verbose?: boolean;
}

export type CopyRecursiveResult = {
	fileCount: number;
	dirCount: number;
	totalCount: number;
};

export const copyRecursiveFilterDefault = (dirEnt: Dirent): boolean => {
	return dirEnt.name !== "." && dirEnt.name !== "..";
};

export const copyRecursiveSync = (
	source: string,
	destination: string,
	options: CopyRecursiveOptions = {},
): CopyRecursiveResult => {
	const result: CopyRecursiveResult = {
		fileCount: 0,
		dirCount: 0,
		totalCount: 0,
	};
	const readDir = options.readdirSync ?? readdirSync;
	const copyFile = options.copyFileSync ?? copyFileSync;
	const mkdir = options.mkdirSync ?? mkdirSync;
	const filter = options.keepIf ?? copyRecursiveFilterDefault;
	const log = options.log ?? ((msg: string) => console.log(msg));
	const sort = options.sort ?? ((a: Dirent, b: Dirent) => a.name.localeCompare(b.name));
	const copyDir = (s: string, d: string): void => {
		const items = readDir(s, { recursive: false, encoding: "utf8", withFileTypes: true })
			.filter((de) => (de.isFile() || de.isDirectory() || de.isSymbolicLink()) && filter(de))
			.sort(sort);
		for (const item of items) {
			const destPath = pathJoin(d, item.name);
			const sourcePath = pathJoin(item.parentPath, item.name);
			if (item.isFile() || item.isSymbolicLink()) {
				copyFile(sourcePath, destPath);
				result.fileCount++;
				result.totalCount++;
			} else if (item.isDirectory()) {
				mkdir(destPath, { recursive: true });
				result.dirCount++;
				result.totalCount++;
				copyDir(sourcePath, destPath);
			}
			options.onCopy?.(item, destPath);
			if (options.verbose) {
				log(`Copied: ${ relative(source, sourcePath) }`);
			}
		}
	};
	copyDir(source, destination);
	return result;
};
