import * as fs from "node:fs";
import { type StatsForFileConfig, statsForFile } from "./stats-for-file.js";

/**
 * Configuration for a {@link assertFileExists} call.
 */
export type AssertFileExistsConfig = StatsForFileConfig;

export const assertFileExists = (
	filePath: string,
	config: AssertFileExistsConfig = {},
): fs.Stats => {
	const stats = statsForFile(filePath, config);
	if (stats == null) {
		throw new Error(`File does not exist: ${ filePath }`);
	}
	return stats;
};
