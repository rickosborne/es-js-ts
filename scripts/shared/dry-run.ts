import * as process from "node:process";

export const isDryRun = process.argv.includes("--dry-run");
