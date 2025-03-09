import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, resolve as pathResolve } from "node:path";

export const fetchAndCacheText = async (url: string): Promise<string> => {
	await mkdir(".cache", { recursive: true });
	const ext = extname(basename(url));
	const cacheFileName = createHash("SHA-512").update(url).digest("base64url").concat(ext);
	const cacheFilePath = pathResolve(".cache", cacheFileName);
	const stats = await stat(cacheFilePath).catch(() => undefined);
	if (stats?.isFile() ?? false) {
		return readFile(cacheFilePath, { encoding: "utf-8" });
	}
	const response = await fetch(url, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${ response.status } ${ response.statusText } ${ url }`);
	}
	const contentType = response.headers.get("content-type");
	if (contentType == null || !contentType.startsWith("text/")) {
		throw new Error(`Unexpected content-type: ${ contentType ?? "(null)" } for ${ url }`);
	}
	const text = await response.text();
	await writeFile(cacheFilePath, text, { encoding: "utf-8" });
	return text;
};
