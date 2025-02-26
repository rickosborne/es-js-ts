import { expect } from "chai";
import { describe, test } from "mocha";
import { type Duration, type DurationWithText, formatDuration, parseDuration, secondsFromDuration } from "../duration.js";

describe(parseDuration.name, () => {
	describe("valid", () => {
		const examples: [ text: string, duration: Duration | DurationWithText ][] = [
			[ "PT0S", { second: 0 } ],
			[ "P0Y", { year: 0 } ],
			[ "PY", { year: 0 } ],
			[ "-PY", { year: 0 } ],
			[ "P-Y", { year: 0 } ],
			[ "-P1Y", { year: -1 } ],
			[ "P-1Y", { year: -1 } ],
			[ "-P-1Y", { year: 1 } ],
			[ "-P-1Y2M", { year: 1, month: -2 } ],
			[ "P1Y2M3W4DT5H6M7.89S", { year: 1, month: 2, week: 3, day: 4, hour: 5, minute: 6, second: 7.89 } ],
			[ "P3,4D", { day: 3.4 } ],
			[ "P3,4D!", { day: 3.4, text: "P3,4D" } ],
			[ "PT", {} ],
			[ "P", {} ],
			[ "PT!", { text: "PT" } ],
			[ "P!", { text: "P" } ],
			[ "P1.W", { week: 1 } ],
			[ "P-1.W", { week: -1 } ],
		];
		for (const [ text, expected ] of examples) {
			test(text, () => {
				expect(parseDuration(text), text).eql({ text, ...expected });
			});
		}
	});
	describe("invalid", () => {
		const examples: [ text: string, message: string ][] = [
			[ "PS", "Designator S at 1 is only valid after the T in a Duration" ],
			[ "P1Y1Y", "Duplicate designator Y at 4 in Duration" ],
			[ "P0.5.2W", "Invalid decimal number in Duration at 4" ],
			[ "P1..W", "Invalid decimal number in Duration at 3" ],
			[ "P5", "Missing designator in Duration at 2" ],
			[ "PTT", "Duplicate T designator in Duration at 2" ],
			[ "PT1W", "Designator W at 3 is only valid before the T in a Duration" ],
			[ "P5S", "Designator S at 2 is only valid after the T in a Duration" ],
			[ "garbage", "Invalid Duration at 0" ],
			[ "", "Invalid Duration at 0" ],
			[ "P-", "Missing designator in Duration at 2" ],
			[ "PT-", "Missing designator in Duration at 3" ],
		];
		for (const [ text, message ] of examples) {
			test(text, () => {
				expect(() => parseDuration(text)).throws(SyntaxError, message);
			});
		}
	});
});

describe(secondsFromDuration.name, () => {
	const examples: [text: string, expected: number][] = [
		[ "P0W", 0 ],
		[ "P0Y", 0 ],
		[ "P0M", 0 ],
		[ "PT1H2M3S", 3723 ],
		[ "P3W4DT5H6M7.89S", (3 * 604_800) + (4 * 86_400) + (5 * 3600) + (6 * 60) + 7.89 ],
	];
	for (const [ text, expected ] of examples) {
		it(text, () => {
			expect(secondsFromDuration(parseDuration(text))).eq(expected);
		});
	}
	const fails: (string | Duration)[] = [
		"P1M",
		"P2Y",
		{ month: 1 },
	];
	for (const invalid of fails) {
		const duration = typeof invalid === "string" ? parseDuration(invalid) : invalid;
		const text = typeof invalid === "string" ? invalid : formatDuration(invalid);
		it(text, () => {
			expect(() => secondsFromDuration(duration)).throws(Error);
		});
	}
});

describe(formatDuration.name, () => {
	const examples: DurationWithText[] = [
		{ text: "PT" },
		{ year: 1, month: 2, week: 3, day: 4, hour: 5, minute: 6, second: 7.89, text: "P1Y2M3W4DT5H6M7.89S" },
	];
	for (const example of examples) {
		test(example.text, () => {
			expect(formatDuration(example)).eq(example.text);
		});
	}
});
