import { statSync } from "node:fs";
import * as path from "node:path";

export const dirExists = (...parts: string[]): boolean => {
	return statSync(path.join(...parts), { throwIfNoEntry: false })?.isDirectory() === true;
};
