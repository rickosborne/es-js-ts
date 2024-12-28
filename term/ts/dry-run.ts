import * as process from "node:process";

/**
 * Flag to indicate whether <kbd>--dry-run</kbd> was provided on the
 * command line.
 */
export const isDryRun = process.argv.slice(2).includes("--dry-run");
