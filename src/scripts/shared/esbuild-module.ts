import { copyRecursiveSync, readFile, writeText } from "@rickosborne/term";
import type { BuildOptions } from "esbuild";
import { build as esbuild } from "esbuild";
import * as console from "node:console";
import * as fs from "node:fs";
import { readdirSync } from "node:fs";
import * as path from "node:path";
import { buildPlus, distPlus, packagesPlus, srcPlus } from "./project-root.js";

const fixImports = (filePath: string) => {
	let ext: string;
	if (filePath.endsWith(".cjs")) {
		ext = ".cjs";
	} else if (filePath.endsWith(".mjs")) {
		ext = ".mjs";
	} else if (filePath.endsWith(".d.ts")) {
		ext = "";
	} else {
		throw new Error(`Neither cjs nor mjs: ${ filePath }`);
	}
	const original = readFile(filePath);
	const modified = original
		.replace(/(?<= from ")(\.\.?\/[^"]+?)\.js(?=")/g, `$1${ ext }`)
		.replace(/(?<=(?:require|import)\(")(\.\.?\/[^"]+?)\.js(?="\))/g, `$1${ ext }`);
	if (modified !== original) {
		writeText(filePath, modified, { silent: true });
	}
};

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
	console.log(`   ☑️ Copied ${ moduleName } types: ${ copied.fileCount / 2 }`);
	await Promise.all([
		cjsPromise,
		esmPromise,
	]);
	readdirSync(distModule, { encoding: "utf8", recursive: false, withFileTypes: true })
		.filter((de) => de.isFile() && (de.name.endsWith(".cjs") || de.name.endsWith(".mjs") || de.name === "index.d.ts"))
		.map((de) => path.join(de.parentPath, de.name))
		.forEach((filePath) => fixImports(filePath));
	console.log(`   ☑️ Built ${ moduleName }`);
}
