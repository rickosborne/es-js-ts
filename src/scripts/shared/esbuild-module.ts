import { copyRecursiveSync } from "@rickosborne/term";
import { type BuildOptions, build as esbuild } from "esbuild";
import * as console from "node:console";
import * as fs from "node:fs";
import * as path from "node:path";
import { buildPlus, distPlus, packagesPlus, srcPlus } from "./project-root.js";

export async function esbuildModule(
	moduleName: string,
): Promise<void> {
	const srcModule = packagesPlus(moduleName);
	// rimraf.sync(path.join(moduleRoot, "*.tsbuildinfo"), { glob: true });
	const distModule = distPlus(moduleName);
	fs.mkdirSync(distModule, { recursive: true });
	const baseConfig: BuildOptions = {
		bundle: false,
		charset: "utf8",
		entryPoints: [ path.join(srcModule, "*.ts") ],
		keepNames: true,
		loader: {
			".ts": "ts",
		},
		minify: false,
		packages: "external",
		platform: "neutral",
		sourcemap: true,
		sourcesContent: false,
		target: [ "node16" ],
		treeShaking: false,
	};
	const cjsPromise = esbuild({
		...baseConfig,
		format: "cjs",
		outdir: distModule,
		outExtension: {
			".js": ".cjs",
		},
		tsconfig: srcPlus("tsconfig.build.json"),
	});
	const esmPromise = esbuild({
		...baseConfig,
		format: "esm",
		outdir: distModule,
		outExtension: {
			".js": ".mjs",
		},
		tsconfig: srcPlus("tsconfig.build.json"),
	});
	const copied = copyRecursiveSync(buildPlus("packages", moduleName), distModule);
	console.log(`   ☑️ Copied ${moduleName} types: ${ copied.fileCount / 2 }`);
	await Promise.all([
		cjsPromise,
		esmPromise,
	]);
	console.log(`   ☑️ Built ${moduleName}`);
}
