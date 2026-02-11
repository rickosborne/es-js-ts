#!/usr/bin/env node
// This is a port of jwz's original perl script: https://www.jwz.org/hacks/jsonbomb.pl

// (comments from the original script)
// Copyright © 2026 Jamie Zawinski <jwz@jwz.org>
//
// Permission to use, copy, modify, distribute, and sell this software and its
// documentation for any purpose is hereby granted without fee, provided that
// the above copyright notice appear in all copies and that both that
// copyright notice and this permission notice appear in supporting
// documentation.  No representations are made about the suitability of this
// software for any purpose.  It is provided "as is" without express or
// implied warranty.
// Creates an absolutely enormous, but syntactically correct, JSON file,
// suitable for use as a zipbomb.
//
// It attempts to stay below various length and depth limitations, with my
// best guesses as to what typical parsers' limits are; the goal here being
// to consume as much of the parser's time and memory as possible before it
// has an excuse to give up early.
//
// With a 10GB file, 'jq' parses the entire file and produces no error
// messages, but also no output, and takes nearly 60 seconds to do so
// (Mac Studio M1 Ultra, 2026).
//
// "jsonbomb.pl --max-size 10GB | gzip --best" yields a 705MB file.
// With --no-permute-strings, it is a more reasonable 61MB.
//
// See https://www.jwz.org/blog/2026/01/zipbomb-json/
// and https://www.jwz.org/blog/2024/02/harassing-botnets-with-zipbombs/
//
// Created:  1-Feb-2026.

import { basename } from "node:path";

let verbose: number = 1;
let maxArrayDepth: number = 1024;
let maxArrayLength: number = 1024;
let maxObjectDepth: number = 1024;
let maxObjectKeyLength: number = 250;
let maxObjectKeys: number = 1024;
let maxOutputBytes: number = 1024 * 1024;
let maxStringLength: number = 1024;
let baseText: string = "All work and no play makes Jack a dull boy.";
let permuteStringsP: boolean = true;

const progName: string = basename(process.argv[1] ?? "").replace(/\..*$/, "").replace(/^$/, "jsonbomb");
const version = "$Revision: 1.03 $".replace(/^\D+|\D+$/gs, "");

type JsonType = "string" | "array" | "object";

const usage = (message?: string | undefined): never => {
	if (message != null) {
		process.stderr.write(`${progName}: ${message}\n`);
	}
	process.stderr.write(`
# version: ${version}
usage: npx --package @rickosborne/jsonbomb jsonbomb [--verbose] [--quiet]
 [--max-size ${Math.floor(maxOutputBytes / 1024)}K]
 [--permute-strings | --no-permute-strings]
 [--max-object-keys ${maxObjectKeys}]
 [--max-object-depth ${maxObjectDepth}]
 [--max-object-key-length ${maxObjectKeyLength}]
 [--max-array-length ${maxArrayLength}]
 [--max-array-depth ${maxArrayDepth}]
 [--max-string-length ${maxStringLength}]
 [--base-text STRING]
 > OUTFILE.json
	`.trim().concat("\n"));
	process.exit(1);
};

/**
 * @param arg - Command-line param name.
 * @param size - Value for the param.
 * @returns Size in bytes.
 */
const parseBytes = (arg: string, size: string | undefined): number | undefined => {
	if (size == null) {
		return usage(`Unparsable size: ${arg}`);
	}
	const [ _all, digits, unit = "" ] = size.toUpperCase().match(/^(\d+(?:\.\d*)?)\s*([GKM]I?B?)?/s) ?? [];
	if (digits == null) {
		// throw new SyntaxError(`Unparsable size: ${arg} ${size}`);
		return undefined;
	}
	const num = digits.includes(".") ? Number.parseFloat(digits) : Number.parseInt(digits, 10);
	if (Number.isNaN(num) || num <= 0 || num >= Number.MAX_VALUE || num <= Number.MIN_VALUE) {
		throw new SyntaxError(`Unparsable size: ${arg} ${size}`);
	}
	let exponent: number;
	if (unit.startsWith("K")) {
		exponent = 1;
	} else if (unit.startsWith("M")) {
		exponent = 2;
	} else if (unit.startsWith("G")) {
		exponent = 3;
	} else {
		exponent = 0;
	}
	return Math.floor(num * Math.pow(1024, exponent));
};

const ONE_KIB = 1024;
const ONE_MIB = ONE_KIB * 1024;
const ONE_GIB = ONE_MIB * 1024;
const TWO_GIB = 2 * ONE_GIB;

const sizeStr = (size: number | undefined): string => {
	if (size == null) {
		return "0 bytes";
	}
	let divisor: number;
	let unit: string;
	if (size > TWO_GIB) {
		divisor = ONE_GIB;
		unit = "GB";
	} else if (size > ONE_MIB) {
		divisor = ONE_MIB;
		unit = "MB";
	} else if (size > ONE_KIB) {
		divisor = ONE_KIB;
		unit = "KB";
	} else {
		divisor = 1;
		unit = "bytes";
	}
	return `${Math.floor(size / divisor)} ${unit}`;
};

let lastStatusTime: number | undefined;

const logStatus = (bytes: number): void => {
	if (verbose < 1) {
		return;
	}
	// perl's `time()` function has 1s resolution.
	const time = Math.floor(Date.now() / 1_000);
	lastStatusTime ??= time;
	if (time > lastStatusTime + 10) {
		const percent = Math.floor(100 * bytes / maxOutputBytes);
		process.stderr.write(`${progName}: ${sizeStr(bytes)} (${percent}%) of ${sizeStr(maxOutputBytes)}\n`);
		lastStatusTime = time;
	}
};

const scrmable = (line: string): string => {
	const words: string[] = [];
	for (let word of line.split(/\s+/)) {
		const letters = word.split("");
		const first = letters.shift()!;
		const last = letters.pop();
		if (last != null && Math.random() > 0.8) {
			let i = letters.length;
			while (i-- > 0) {
				const j = Math.floor(Math.random() * i);
				const s = letters[i]!;
				letters[i] = letters[j]!;
				letters[j] = s;
				i = 0;
			}
			word = first.concat(letters.join(""), last);
		}
		if (Math.random() > 0.9) {
			word = word.toUpperCase();
		}
		words.push(word);
	}
	return words.join(" ");
};

const makeString = (maxLength: number): string => {
	const L = baseText.length;
	let L2 = 0;
	const s: string[] = [];
	while (L2 + L < maxLength) {
		s.push(baseText);
		L2 += L + 1;
	}
	if (s.length === 0) {
		const start = permuteStringsP ? Math.floor(L * Math.random() * 0.3) : 0;
		let L3 = L - start;
		L3 = Math.min(L3, maxLength);
		if (permuteStringsP) {
			L3 = Math.floor(L3 * (1 - Math.random() * 0.3));
		}
		s.push(baseText.substring(start, L3));
	}
	let joined = s.join(" ");
	if (permuteStringsP) {
		joined = scrmable(joined);
	}
	return JSON.stringify(joined);
};

const randomItem = <T>(items: T[]): T => {
	return items[Math.floor(Math.random() * items.length)]!;
};

// (comment from the original script)
// I'd kind of like to unroll this to use heap instead of stack,
// but it's sure a lot easier to think about it recursively.

const jsonEmitThing = (type: JsonType, depth: number, totalBytes: number): number => {
	let thisBytes: number = 0;
	const print = (text: string): void => {
		process.stdout.write(text);
		thisBytes += text.length;
	};
	if (type === "string") {
		const s = makeString(maxStringLength);
		print(s);
	} else if (type === "array") {
		const n = Math.floor(maxArrayLength * (1 - (Math.random() * 0.2)));
		const types: JsonType[] = depth >= maxArrayDepth ? [ "string" ] : [ "string","string","string","string" ,"object" ];
		print("[");
		for (let i = 0; i < n; i++) {
			if (i > 0) {
				print(",\n");
			}
			const type2 = randomItem(types);
			thisBytes += jsonEmitThing(type2, depth + 1, totalBytes + thisBytes);
			if (totalBytes + thisBytes > maxOutputBytes) {
				break;
			}
		}
		print("]");
	} else if (type === "object") {
		const n = Math.floor(maxArrayLength * (1 - (Math.random() * 0.2)));
		const types: JsonType[] = depth >= maxArrayDepth ? [ "string" ] : [ "string","string","string","string" ,"object" ];
		print("{");
		// (comment from the original script)
		// Technically duplicate keys are allowed (last one wins) but some
		// parsers consider it an error.
		const dupes = new Set<string>();
		for (let i = 0; i < n; i++) {
			if (i > 0) {
				print(",\n");
			}
			let s = makeString(maxObjectKeyLength);
			s = s.replace(/\s/gs, "_");
			if (dupes.has(s)) {
				const ii = BigInt(i).toString(16).toUpperCase();
				s = s.replace(/"$/s, `_${ii}"`);
			}
			dupes.add(s);
			print(s.concat(":"));
			const type2 = randomItem(types);
			thisBytes += jsonEmitThing(type2, depth + 1, totalBytes + thisBytes);
			if (totalBytes + thisBytes > maxOutputBytes) {
				break;
			}
		}
		print("}");
	} else {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		throw new Error(`Unknown type: ${type}`);
	}
	logStatus(totalBytes + thisBytes);
	return thisBytes;
};

const jsonBomb = () => {
	// (comment from the original script)
	// Top level object is always an array.
	process.stdout.write("[");
	let bytes = 1;
	let i = 0;
	while (bytes < maxOutputBytes) {
		if (i > 0) {
			process.stdout.write(",\n");
			bytes += 2;
		}
		const types: JsonType[] = [ "array", "object", "string", "string", "string", "string" ];
		const type = types[Math.floor(Math.random() * types.length)]!;
		bytes += jsonEmitThing(type, 0, bytes );
		i++;
		if (i > maxArrayLength) {
			// (comment from the original script)
			// We've hit the max length of the top-level array object.
			// Increase the limits and keep going, because why not.
			if (verbose > 0) {
				process.stderr.write(`${progName}: hit max length; increasing limits.\n`);
			}
			maxObjectDepth *= 2;
			maxArrayDepth *= 2;
		}
	}
	process.stdout.write("]\n");
	bytes += 2;
	lastStatusTime = 0;
	logStatus(bytes);
};

const numSetters: Record<string, (num: number) => void> = {
	"max-size": (n) => maxOutputBytes = n,
	"max-object-keys": (n) => maxObjectKeys = n,
	"max-object-depth": (n) => maxObjectDepth = n,
	"max-object-key-length": (n) => maxObjectKeyLength = n,
	"max-array-length": (n) => maxArrayLength = n,
	"max-array-depth": (n) => maxArrayDepth = n,
	"max-string-length": (n) => maxStringLength = n,
};

const main = () => {
	const args = process.argv.slice(2);
	while (args.length > 0) {
		const arg = args.shift()!;
		if (/^--?verbose$/s.test(arg)) {
			verbose++;
		} else if (/^-v+$/s.test(arg)) {
			verbose += arg.length - 1;
		} else if (/^--?quiet$/s.test(arg)) {
			verbose = 0;
		} else if (/^--?base-text$/s.test(arg)) {
			const text = args.shift()!;
			if (text == null) {
				return usage(`${ arg } requires a text value`);
			} else {
				baseText = text;
			}
		} else if (/^--?permute(-strings?)?$/s.test(arg)) {
			permuteStringsP = true;
		} else if (/^--?no-permute(-strings?)?$/s.test(arg)) {
			permuteStringsP = false;
		} else if (/^--?(\?|h|help)$/s.test(arg)) {
			return usage();
		} else {
			const key = arg.replace(/^-+/, "");
			const setter = numSetters[key];
			if (setter == null) {
				return usage(`Unknown arg: ${ arg }`);
			}
			const raw = args.shift();
			if (raw == null) {
				return usage(`Arg ${arg} requires a numeric value`);
			}
			const num = parseBytes(arg, raw);
			if (num == null) {
				return usage(`Bad value for ${arg}: ${raw}`);
			}
			setter(num);
		}
	}
	jsonBomb();
};

main();
