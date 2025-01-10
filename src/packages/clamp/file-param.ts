import { statsForFile } from "@rickosborne/term";
import { Stats } from "node:fs";
import * as path from "node:path";
import type { CommandParamBase, ParamHandler, TypedCommandParam } from "./common.js";

/**
 * A command-line parameter which references a file.
 */
export type FileCommandParam = CommandParamBase & {
	/**
	 * If true, the file must exist.  If false, the file must
	 * not exist.  If undefined, an error will be thrown if
	 * the path exists but is not a file.
	 */
	existing?: boolean;
	/**
	 * Validate and transform the argument before it is returned.
	 * @defaultValue {@link parseFileArg}
	 */
	parse?: (this: void, text: string, param: FileCommandParam) => FileArg;
	/**
	 * Prepend this path if it is not already provided.
	 */
	path?: string;
	type: "file";
};

/**
 * File argument resolved from a file command-line parameter.
 */
export type FileArg = {
	/**
	 * Path to the file.
	 */
	filePath: string;
	/**
	 * If the file exists, the filesystem stats for it.
	 */
	stats: Stats | undefined;
}

/**
 * Validate and transform the argument before it is returned.
 * @internal
 */
export const parseFileArg = (text: string, param: FileCommandParam): FileArg => {
	let filePath = text;
	if (param.path != null && !filePath.startsWith(param.path)) {
		filePath = path.join(param.path, filePath);
	}
	const stats = statsForFile(filePath);
	const exists = stats != null;
	if (param.existing !== undefined) {
		if (exists !== param.existing) {
			throw new Error(`File ${ exists ? "exists" : "does not exist" }: ${ filePath }`);
		}
	}
	return { filePath, stats };
};

/**
 * @internal
 */
export const isFileParam = (param: TypedCommandParam): param is FileCommandParam => {
	return param.type === "file";
};

/**
 * @internal
 */
export const fileParamHandler: ParamHandler<FileCommandParam, FileArg> = {
	matchesParam: isFileParam,
	parseArg: parseFileArg,
	placeholderForParam(param: FileCommandParam): string | undefined {
		return param.placeholder ?? "(path)";
	},
};
