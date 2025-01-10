import { statSync } from "node:fs";
import * as path from "node:path";

/**
 * Synchronous check to see if the given path exists and is a directory.
 */
export const dirExists = (...parts: string[]): boolean => {
	return statSync(path.join(...parts), { throwIfNoEntry: false })?.isDirectory() === true;
};
