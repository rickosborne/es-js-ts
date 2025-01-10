import { statSync as originalStatSync } from "node:fs";
import { join as pathJoin } from "node:path";

export type StatSyncLike = (path: string, options: { throwIfNoEntry: false }) => {isFile: () => boolean};

/**
 * Synchronous check to see whether the given path exists and is a file.
 */
export function fileExists(...parts: string[]): boolean;
/**
 * Synchronous check to see whether the given path exists and is a file.
 * This form accepts an override for `fs.statSync`.
 */
export function fileExists(statSync: StatSyncLike, ...parts: string[]): boolean;
export function fileExists(first: string | StatSyncLike, ...parts: string[]): boolean {
	const statSync: StatSyncLike = typeof first === "string" ? originalStatSync : first;
	const path = typeof first === "string" ? pathJoin(first, ...parts) : pathJoin(...parts);
	return statSync(path, { throwIfNoEntry: false })?.isFile() === true;
}
