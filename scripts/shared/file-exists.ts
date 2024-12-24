import { statSync } from "node:fs";
import * as path from "node:path";

export const fileExists = (...parts: string[]): boolean => {
	return statSync(path.join(...parts), { throwIfNoEntry: false })?.isFile() === true;
};
