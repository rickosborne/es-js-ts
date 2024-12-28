import { statSync } from "node:fs";
import * as path from "node:path";

/**
 * Synchronous check to see whether the given path exists and is a file.
 */
export const fileExists = (...parts: string[]): boolean => {
	return statSync(path.join(...parts), { throwIfNoEntry: false })?.isFile() === true;
};
