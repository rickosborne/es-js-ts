import * as childProcess from "node:child_process";

/**
 * The text values which can be obtained from a `git log` invocation.
 */
export interface RawGitInfo {
	authorEmail: string;
	authorName: string;
	commitDateISO: string;
	commitHash: string;
	parentHash: string;
	refNames: string;
	sigKey?: string | undefined;
	sigStatus: string;
	sigTrust?: string | undefined;
}

/**
 * Information about the current state of git.
 */
export interface GitInfo extends RawGitInfo {
	branches: string[];
	commitDate: Date;
	tags: string[];
}

/**
 * @see {@link https://git-scm.com/docs/pretty-formats | git pretty formats}
 */
const gitPrettyFormats: RawGitInfo = {
	authorEmail: "%ae",
	authorName: "%an",
	commitDateISO: "%aI",
	commitHash: "%H",
	parentHash: "%P",
	refNames: "%D",
	sigKey: "%GF",
	sigStatus: "%G?",
	sigTrust: "%GT",
};

/**
 * Get very basic git status.
 */
export const gitInfo = (): GitInfo => {
	const format = Object.entries(gitPrettyFormats)
		.map(([ k, v ]) => `${k}=${v}`)
		.join("%n");
	const raw = childProcess.execSync(`git log -1 '--pretty=format:${format}'`, {
		encoding: "utf-8",
		timeout: 60_000,
	});
	const info = {
		branches: [] as string[],
		tags: [] as string[],
	} as GitInfo;
	raw.split("\n")
		.map((line) => {
			const match = /^(\w+)=(.*)$/.exec(line);
			return match == null ? undefined : match.slice(1, 3) as [ keyof RawGitInfo, string ];
		})
		.filter((pair) => pair != null)
		.forEach(([ key, value ]) => {
			info[ key ] = value.trim();
		});
	if (info.commitDateISO != null) {
		info.commitDate = new Date(Date.parse(info.commitDateISO));
		// Remove TZ info
		info.commitDateISO = info.commitDate.toISOString();
	}
	if (info.refNames != null) {
		info.refNames.split(",")
			.forEach((part) => {
				if (part.startsWith("tag:")) {
					const tagName = part.substring(4).trim();
					info.tags.push(tagName);
				} else if (part.startsWith("HEAD ->")) {
					const branchName = part.substring(7).trim();
					info.branches.push(branchName);
				} else {
					const branchName = part.trim();
					if (branchName !== "") {
						info.branches.push(branchName);
					}
				}
			});
	}
	return info;
};
