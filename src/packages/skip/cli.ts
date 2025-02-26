import * as console from "node:console";
import * as process from "node:process";
import { definitionFromSource } from "./definition-from-source.js";


async function runCLI() {
	const args = process.argv.slice(2);
	const mode = args.shift();
	if (mode === "def") {
		const sourcePath = args.shift();
		if (sourcePath == null) {
			throw new Error("Expected a path to a source file.");
		}
		const fnName = args.shift();
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const stateMachine = await definitionFromSource(sourcePath, fnName);
		console.info(JSON.stringify(stateMachine, undefined, 2));
	} else {
		console.error("Unknown mode.  Expected: def");
		process.exit(1);
	}
}

runCLI().catch((err: unknown)=> {
	if (err instanceof Error) {
		console.error(`[${err.name}] ${err.message}`);
	} else {
		console.error(err);
	}
	process.exit(1);
});

