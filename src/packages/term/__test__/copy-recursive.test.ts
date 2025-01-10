import { expect } from "chai";
import { describe, it } from "mocha";
import type { Dirent } from "node:fs";
import { copyRecursiveFilterDefault, copyRecursiveSync } from "../copy-recursive.js";

const dirEnt = (name: string, parentPath: string, type: "file" | "dir" | "link"): Dirent => {
	return {
		name,
		parentPath,
		isDirectory: () => type === "dir",
		isFile: () => type === "file",
		isSymbolicLink: () => type === "link",
	} as Dirent;
};

describe(copyRecursiveSync.name, () => {
	it("does what it says", () => {
		const created: string[] = [];
		const copied: string[] = [];
		const logged: string[] = [];
		const checked: string[] = [];
		const notified: string[] = [];
		const readDirResponses: Record<string, Dirent[]> = {
			source: [ dirEnt("child", "source", "dir") ],
			"source/child": [
				dirEnt("file.txt", "source/child", "file"),
				dirEnt("deep", "source/child", "dir"),
				dirEnt("link", "source/child", "link"),
			],
			"source/child/deep": [
				dirEnt("file.json", "source/child/deep", "file"),
				dirEnt(".hidden", "source/child/deep", "file"),
			],
		};
		copyRecursiveSync("source", "destination", {
			copyFileSync(source: string, destination: string): void {
				copied.push(`${ source } => ${ destination }`);
			},
			log: (msg) => {
				logged.push(msg);
			},
			onCopy(dirEnt: Dirent, destination: string): void {
				notified.push(`${ dirEnt.parentPath }!${ dirEnt.name } => ${ destination }`);
			},
			keepIf(dirEnt: Dirent): boolean {
				checked.push(`${ dirEnt.parentPath }!${ dirEnt.name }`);
				return !dirEnt.name.startsWith(".");
			},
			mkdirSync(path: string, options): void {
				expect(options, `mkdir:options:${ path }`).eql({ recursive: true });
				created.push(path);
			},
			readdirSync: (path, options) => {
				expect(options, `readdir:options:${ path }`).eql({ recursive: false, encoding: "utf8", withFileTypes: true });
				const response = readDirResponses[ path ];
				expect(response, `readdir:response:${ path }`).not.eq(undefined);
				return response!;
			},
			sort(a: Dirent, b: Dirent): number {
				return b.name.localeCompare(a.name);
			},
			verbose: true,
		});
		expect(logged, "logged").eql([
			"Copied: child/link",
			"Copied: child/file.txt",
			"Copied: child/deep/file.json",
			"Copied: child/deep",
			"Copied: child",
		]);
		expect(created, "created").eql([
			"destination/child",
			"destination/child/deep",
		]);
		expect(copied, "copied").eql([
			"source/child/link => destination/child/link",
			"source/child/file.txt => destination/child/file.txt",
			"source/child/deep/file.json => destination/child/deep/file.json",
		]);
		expect(checked, "checked").eql([
			"source!child",
			"source/child!file.txt",
			"source/child!deep",
			"source/child!link",
			"source/child/deep!file.json",
			"source/child/deep!.hidden",
		]);
		expect(notified, "notified").eql([
			"source/child!link => destination/child/link",
			"source/child!file.txt => destination/child/file.txt",
			"source/child/deep!file.json => destination/child/deep/file.json",
			"source/child!deep => destination/child/deep",
			"source!child => destination/child",
		]);
	});
});

describe(copyRecursiveFilterDefault.name, () => {
	it("filters out nonsense", () => {
		expect(copyRecursiveFilterDefault(dirEnt(".", "parent", "dir"))).eq(false);
		expect(copyRecursiveFilterDefault(dirEnt(".", "parent", "file"))).eq(false);
		expect(copyRecursiveFilterDefault(dirEnt(".", "parent", "link"))).eq(false);
		expect(copyRecursiveFilterDefault(dirEnt("..", "parent", "dir"))).eq(false);
		expect(copyRecursiveFilterDefault(dirEnt("..", "parent", "file"))).eq(false);
		expect(copyRecursiveFilterDefault(dirEnt("..", "parent", "link"))).eq(false);
	});
	it("allows other stuff", () => {
		expect(copyRecursiveFilterDefault(dirEnt(".hidden", "parent", "file"))).eq(true);
		expect(copyRecursiveFilterDefault(dirEnt(".hidden", "parent", "dir"))).eq(true);
		expect(copyRecursiveFilterDefault(dirEnt(".hidden", "parent", "link"))).eq(true);
	});
});
