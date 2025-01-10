import { ARG_FLAG, envOrArg, isDryRun } from "@rickosborne/term";
import * as childProcess from "node:child_process";
import * as console from "node:console";
import * as path from "node:path";
import * as process from "node:process";
import { promisify } from "node:util";
import { getModulePackages } from "./shared/module-names.js";
import { distPlus } from "./shared/project-root.js";

const exec = promisify(childProcess.exec);

const publish = async (): Promise<number> => {
	const commit = !isDryRun && (envOrArg("--commit") === ARG_FLAG);
	if (commit) {
		console.log(`⚠️ Commit mode.  We're live!`);
	} else {
		console.log(`🌵 Dry run mode`);
	}

	for (const { moduleName } of getModulePackages()) {
		console.log(`📦 ${ moduleName }`);
		let command = "npm publish .";
		if (!commit) {
			command = command.concat(" --dry-run");
		}
		const distModule = path.resolve(distPlus(moduleName));
		const childPromise = exec(command, {
			cwd: distModule,
			encoding: "utf8",
			...(commit ? { stdio: "inherit" } : {}),
		});
		const child = childPromise.child;
		const { stdout, stderr } = await childPromise;
		const exitCode = child.exitCode ?? 0;
		if (exitCode !== 0) {
			console.error(stderr);
			console.error(`❌ Failed to publish ${moduleName}`);
			return exitCode;
		}
		const lines = stdout.split("\n")
			.filter((line) => !line.startsWith("npm notice "))
			.join("\n");
		console.log(lines);
	}
	return 0;
};

publish()
	.then((exitCode: number) => {
		if (exitCode === 0) {
			console.log(`✅ Publish success.`);
		} else {
			process.exit(exitCode);
		}
	})
	.catch((err: unknown) => {
		console.error(err);
		process.exit(1);
	});
