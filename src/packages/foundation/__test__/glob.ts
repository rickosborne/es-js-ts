import { expect } from "chai";
import { describe, test } from "mocha";
import { simpleStarMatch, type StarGlobPart, starMatchParts } from "../glob.js";

describe("glob", () => {
	describe("starMatch", () => {
		const testGlob = (glob: string, parts: StarGlobPart[], successes: string[], failures: string[]): void => {
			test(glob, () => {
				expect(starMatchParts(glob)).eql(parts);
				successes.forEach((text) => {
					expect(simpleStarMatch(glob, text), `pass: ${ JSON.stringify(text) }`).eq(true);
				});
				failures.forEach((text) => {
					expect(simpleStarMatch(glob, text), `fail: ${ JSON.stringify(text) }`).eq(false);
				});
			});
		};
		testGlob("*foo",
			[
				{ at: 0, type: "*" },
				{ at: 1, type: "text", value: "foo" },
			],
			[ "foo", "bar foo", "foo bar foo", "bar foo foo" ],
			[ "fo", "foo ", "foo bar", "" ],
		);
		testGlob("foo*",
			[
				{ at: 0, type: "text", value: "foo" },
				{ at: 3, type: "*" },
			],
			[ "foo", "foot", "foo bar", "foo foo" ],
			[ " foo", "" ],
		);
		testGlob("*foo*",
			[
				{ at: 0, type: "*" },
				{ at: 1, type: "text", value: "foo" },
				{ at: 4, type: "*" },
			],
			[ "foo", " foo", "foo ", "afoot" ],
			[ "", "bar" ],
		);
		testGlob("foo*bar",
			[
				{ at: 0, type: "text", value: "foo" },
				{ at: 3, type: "*" },
				{ at: 4, type: "text", value: "bar" },
			],
			[ "foobar", "foo bar", "foot rebar" ],
			[ "", " foo bar", "foo bar " ],
		);
		testGlob("foo**bar",
			[
				{ at: 0, type: "text", value: "foo" },
				{ at: 3, type: "*" },
				{ at: 5, type: "text", value: "bar" },
			],
			[ "foobar", "foo bar", "foot rebar" ],
			[ "", " foo bar", "foo bar " ],
		);
		testGlob("foo\\**bar",
			[
				{ at: 0, type: "text", value: "foo*" },
				{ at: 5, type: "*" },
				{ at: 6, type: "text", value: "bar" },
			],
			[ "foo*bar", "foo* ??? bar" ],
			[ "", " foo*bar", "foo*bar " ],
		);
		testGlob("foo\\\\**bar",
			[
				{ at: 0, type: "text", value: "foo\\" },
				{ at: 5, type: "*" },
				{ at: 7, type: "text", value: "bar" },
			],
			[ "foo\\bar", "foo\\ ??? bar" ],
			[ "", " foo\\bar", "foo\\bar " ],
		);
		testGlob("foo*bar\\",
			[
				{ at: 0, type: "text", value: "foo" },
				{ at: 3, type: "*" },
				{ at: 4, type: "text", value: "bar\\" },
			],
			[ "foobar\\", "foo bar\\" ],
			[ "", " foobar\\", "foobar\\ " ],
		);
		testGlob("foo*bar\\\\",
			[
				{ at: 0, type: "text", value: "foo" },
				{ at: 3, type: "*" },
				{ at: 4, type: "text", value: "bar\\" },
			],
			[ "foobar\\", "foo bar\\" ],
			[ "", " foobar\\", "foobar\\ " ],
		);
		testGlob("foo\\*",
			[ { at: 0, type: "text", value: "foo*" } ],
			[ "foo*" ],
			[ "", " foo*", "foo", "foo* " ],
		);
		testGlob("foo\\\\*",
			[
				{ at: 0, type: "text", value: "foo\\" },
				{ at: 5, type: "*" },
			],
			[ "foo\\", "foo\\ bar" ],
			[ "", " foo\\", "foo" ],
		);
		testGlob("\\",
			[ { at: 0, type: "text", value: "\\" } ],
			[ "\\" ],
			[ "", " \\", "\\ ", "\\\\" ],
		);
		testGlob("*",
			[ { at: 0, type: "*" } ],
			[ "", "foo", "*" ],
			[ ],
		);
		testGlob("\\\\",
			[ { at: 0, type: "text", value: "\\" } ],
			[ "\\" ],
			[ "", "foo", "\\\\" ],
		);
		testGlob("\\*",
			[ { at: 0, type: "text", value: "*" } ],
			[ "*" ],
			[ "", "**", "foo" ],
		);
		testGlob("", [], [ "" ], [ "foo" ]);
	});
});
