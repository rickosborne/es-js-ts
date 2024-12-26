import * as console from "node:console";
import * as fs from "node:fs";
import { fromRoot } from "./project-root.js";

export const writeText = (filePath: string, text: string): void => {
	const body = text.endsWith("\n") ? text : text.concat("\n");
	console.log(`✏️ Write: ${ fromRoot(filePath) } ${text.length.toLocaleString()}B`);
	fs.writeFileSync(filePath, body, { encoding: "utf-8" });
};
