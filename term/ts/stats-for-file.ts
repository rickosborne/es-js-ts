import * as fs from "node:fs";

/**
 * Configuration for a {@link statsForFile} call.
 */
export type StatsForFileConfig = {
	/**
	 * Underlying filesystem call.  Mostly for unit testing.
	 */
	statSync?: (path: string, options: { throwIfNoEntry: false }) => (undefined | fs.Stats),
	/**
	 * Whether to throw (or just return undefined) if the path
	 * exists but is not a file.
	 * @defaultValue true
	 */
	throwIfNotFile?: boolean;
};

/**
 * Get the stats for a path, if it exists.  Throws if the path does
 * not point to a file.
 */
export const statsForFile = (
	filePath: string,
	config: StatsForFileConfig = {},
): fs.Stats | undefined => {
	const statSync = config.statSync ?? fs.statSync;
	const stats = statSync(filePath, { throwIfNoEntry: false });
	if (stats == null) {
		return undefined;
	}
	const throwIfNotFile = config.throwIfNotFile ?? true;
	if (!stats.isFile() && throwIfNotFile) {
		throw new Error(`Not a file: ${filePath}`);
	}
	return stats;
};
