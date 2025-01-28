import { scrubStackTrace } from "@rickosborne/guard";
import type { Stats } from "node:fs";
import { FileMissingError } from "./file-missing-error.js";
import { statsForFile } from "./stats-for-file.js";

/**
 * Configuration for a {@link assertFileExists} call.
 */
export interface AssertFileExistsConfig {
	/**
	 * Underlying filesystem call.  Mostly for unit testing.
	 */
	statSync?: (path: string, options: { throwIfNoEntry: false }) => (undefined | Stats),
}

export const assertFileExists = (
	filePath: string,
	config: AssertFileExistsConfig = {},
): Stats => {
	const stats = statsForFile(filePath, config);
	if (stats == null) {
		throw scrubStackTrace(new FileMissingError(filePath), "assertFileExists");
	}
	return stats;
};
