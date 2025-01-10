import { expect } from "chai";
import { describe, it } from "mocha";
import { parseLocalDate } from "../parse-local-date.js";

const buildDate = (utc: boolean, year: number, month: number, day: number, hour = 0, min = 0, sec = 0, ms = 0): Date => {
	const date = new Date(0);
	if (utc) {
		date.setUTCFullYear(year, month - 1, day);
		date.setUTCHours(hour, min, sec, ms);
	} else {
		date.setFullYear(year, month - 1, day);
		date.setHours(hour, min, sec, ms);
	}
	return date;
};

describe(parseLocalDate.name, () => {
	it("works for simple dates", () => {
		expect(parseLocalDate("2024-01-01")).eql(buildDate(false, 2024, 1, 1));
		expect(parseLocalDate("20240101")).eql(buildDate(false, 2024, 1, 1));
		expect(parseLocalDate("2024-12-31")).eql(buildDate(false, 2024, 12, 31));
	});
	it("allows time zones without times", () => {
		expect(parseLocalDate("2024-01-01", { zone: true })).eql(buildDate(false, 2024, 1, 1));
		expect(() => parseLocalDate("2024-12-31Z")).throws(RangeError, /Date expected/);
		expect(parseLocalDate("2024-12-31Z", { zone: true })).eql(buildDate(true, 2024, 12, 31));
		expect(parseLocalDate("2024-12-31-05", { zone: true })).eql(buildDate(true, 2024, 12, 31, 5));
		expect(parseLocalDate("2024-12-31-05:30", { zone: true })).eql(buildDate(true, 2024, 12, 31, 5, 30));
	});
	it("allows times when specified, or throws otherwise", () => {
		expect(() => parseLocalDate("2024-12-31T12:01")).throws(RangeError, /Date expected/);
		expect(parseLocalDate("2024-12-31T12:01", { time: true })).eql(buildDate(false, 2024, 12, 31, 12, 1));
		expect(parseLocalDate("2024-12-31T12:01:23", { time: true })).eql(buildDate(false, 2024, 12, 31, 12, 1, 23));
		expect(parseLocalDate("20241231120123", { time: true })).eql(buildDate(false, 2024, 12, 31, 12, 1, 23));
	});
	it("allows times and zones", () => {
		expect(parseLocalDate("2024-01-01", { time: true, zone: true })).eql(buildDate(false, 2024, 1, 1));
		expect(parseLocalDate("2024-01-01T02:03", { time: true, zone: true })).eql(buildDate(false, 2024, 1, 1, 2, 3));
		expect(parseLocalDate("2024-01-01 02:03", { time: true, zone: true })).eql(buildDate(false, 2024, 1, 1, 2, 3));
		expect(parseLocalDate("2024-01-01@02:03", { time: true, zone: true })).eql(buildDate(false, 2024, 1, 1, 2, 3));
		expect(parseLocalDate("2024-01-01 02:03", { time: true, zone: true })).eql(buildDate(false, 2024, 1, 1, 2, 3));
		expect(parseLocalDate("2024-01-01 02:03Z", { time: true, zone: true })).eql(buildDate(true, 2024, 1, 1, 2, 3));
		expect(parseLocalDate("2024-01-01 02:03-04", { time: true, zone: true })).eql(buildDate(true, 2024, 1, 1, 6, 3));
		expect(parseLocalDate("2024-01-01 02:03-04:15", { time: true, zone: true })).eql(buildDate(true, 2024, 1, 1, 6, 18));
		expect(parseLocalDate("2024-01-01 02:03-0415", { time: true, zone: true })).eql(buildDate(true, 2024, 1, 1, 6, 18));
	});
});
