import { readFileSync } from "node:fs";

/**
 * Synchronous read of a file as text using UTF-8 encoding.
 */
export const readFile = (path: string) => readFileSync(path, { encoding: "utf-8" });

/**
 * Synchronous read of a file as UTF-8 text, parsing it as JSON.
 */
export const readJson = <T>(path: string) => JSON.parse(readFile(path)) as T;
