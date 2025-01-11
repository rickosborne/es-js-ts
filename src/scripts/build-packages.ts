import { envOrArg, type PackageJsonLike, readFile, readPackageJson } from "@rickosborne/term";
import * as childProcess from "node:child_process";
import * as console from "node:console";
import * as process from "node:process";
import * as util from "node:util";
import { limitFunction } from "p-limit";
import { rimraf } from "rimraf";
import { gitInfo } from "../packages/term/git-info.js";
import { documentModule } from "./shared/document-module.js";
import { esbuildModule } from "./shared/esbuild-module.js";
import { getModulePackages } from "./shared/module-names.js";
import { buildRoot, distRoot, srcRoot, staticPlus } from "./shared/project-root.js";
import { repackageModule } from "./shared/repackage-module.js";
import { updateModuleBarrel } from "./shared/update-module-barrel.js";

const execPromise = util.promisify(childProcess.exec);

let failed = false;
const concurrency = Number.parseInt(envOrArg([ "concurrency" ]) ?? "3", 10);
const moduleNames: string[] = [];

const build = async (): Promise<number> => {
	const rootPackage = readPackageJson(srcRoot);
	rimraf.sync(buildRoot, { preserveRoot: true });
	rimraf.sync(distRoot, { preserveRoot: true });
	const apiExtractorTemplate = readFile(staticPlus("api-extractor.template.json"));
	const typesChild = execPromise(`./node_modules/.bin/tsc -b tsconfig.types.json`, {
		cwd: srcRoot,
		encoding: "utf8",
		env: process.env,
	});
	typesChild.child.stdout?.pipe(process.stdout);
	typesChild.child.stderr?.pipe(process.stderr);
	await typesChild
		.then(() => console.log("✅ Built Types"))
		.catch(() => {
			console.error("❌ Build Types failed.");
			failed = true;
		});
	const git = gitInfo();
	console.dir(git);
	const modulePackages = getModulePackages();
	const buildModule = limitFunction(async (moduleName: string, modulePackage: PackageJsonLike) => {
		console.log(`📦 Building ${ moduleName }`);
		moduleNames.push(moduleName);
		updateModuleBarrel(moduleName);
		await esbuildModule(moduleName);
		repackageModule(moduleName, modulePackage, rootPackage, { git });
		documentModule(moduleName, apiExtractorTemplate);
	}, { concurrency });
	await Promise.all(modulePackages.map(({ moduleName, modulePackage }) => buildModule(moduleName, modulePackage)));
	rimraf.sync(buildRoot, { preserveRoot: false });
	return 0;
};

build()
	.then((exitCode: number) => {
		if (failed) {
			console.error("❌ Build failed.");
			process.exit(1);
		} else {
			console.log(`✅ Build successful: ${ moduleNames.join(" ") }`);
			process.exit(exitCode);
		}
	})
	.catch((err: unknown) => {
		console.error(err);
		console.error("❌ Build failed.");
		process.exit(1);
	});
