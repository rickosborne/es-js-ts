import { deepSort, formatBytes } from "@rickosborne/foundation";
import type { Consumer, TriConsumer, UnaryOperator } from "@rickosborne/typical";
import * as console from "node:console";
import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import { type PackageJsonLike, preparePackageJsonForSerialization } from "./package-json.js";

/**
 * Configuration for a {@link writeText} call.
 */
export type WriteTextConfig = {
	/**
	 * Override the console log handler, as you may want to do in
	 * unit tests.
	 */
	consoleLog?: Consumer<string>;
	/**
	 * Ensure the text has a final newline.
	 * @defaultValue true
	 */
	finalNewline?: boolean;
	/**
	 * When logging the operation to the console, format the path to be
	 * relative to this value.
	 * @defaultValue process.cwd()
	 */
	relativeTo?: string;
	/**
	 * Whether to log the operation to the console.
	 * @defaultValue false
	 */
	silent?: boolean;
	/**
	 * Override the underlying filesystem write handler, as you may
	 * want to do in unit tests.
	 */
	writeFileSync?: TriConsumer<string, string, { encoding: "utf-8" }>;
}

/**
 * Synchronously write a file as UTF-8 text.
 */
export const writeText = (
	filePath: string,
	text: string,
	config: WriteTextConfig = {},
): void => {
	let body = text;
	if (config.finalNewline !== false && !body.endsWith("\n")) {
		body = body.concat("\n");
	}
	if (config.silent !== true) {
		const relativeTo = config.relativeTo ?? process.cwd();
		const relative = path.relative(relativeTo, filePath);
		const consoleLog = config.consoleLog ?? ((msg: string) => console.log(msg));
		consoleLog(`✏️ Write: ${ relative } ${ formatBytes(text.length) }`);
	}
	const writeFileSync = config.writeFileSync ?? fs.writeFileSync;
	writeFileSync(filePath, body, { encoding: "utf-8" });
};

/**
 * Configuration for a {@link writeJson} call.
 */
export type WriteJsonConfig = WriteTextConfig & {
	/**
	 * Perform any last-minute text replacements on the JSON before
	 * it is written.
	 */
	modifyJson?: UnaryOperator<string>;
	/**
	 * Perform any pre-serialization modifications to the sorted version
	 * of the value.
	 */
	modifySorted?: <T>(value: T) => (void | undefined | T);
	/**
	 * Indent width or text for JSON serialization.
	 * @defaultValue "\\t"
	 */
	indent?: string | number;
	/**
	 * Function for writing to the filesystem.  Mostly used for unit tests.
	 */
	writeText?: typeof writeText;
}

/**
 * Serialize and synchronously write out JSON to a UTF-8 text file.
 * Has some extra special handling for <kbd>package.json</kbd> files.
 */
export const writeJson = (
	filePath: string,
	value: unknown,
	config: WriteJsonConfig = {},
): void => {
	let sorted = deepSort(value);
	if (config.modifySorted != null) {
		sorted = config.modifySorted(sorted) ?? sorted;
	}
	if (filePath.endsWith("package.json")) {
		preparePackageJsonForSerialization(sorted as PackageJsonLike);
	}
	const indent = config.indent ?? "\t";
	let json = JSON.stringify(sorted, undefined, indent).concat("\n");
	if (config.modifyJson != null) {
		json = config.modifyJson(json);
	}
	const writeTextFn = config.writeText ?? writeText;
	writeTextFn(filePath, json, config);
};
