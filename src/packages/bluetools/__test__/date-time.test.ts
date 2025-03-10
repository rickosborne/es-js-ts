import { expect } from "chai";
import { describe, test } from "mocha";
import { dataViewFromHex } from "../data-view-from-hex.js";
import { type DateTime, dateTimeFromDataView, DateTimeImpl } from "../date-time.js";

const testOne = (
	hex: string,
	expected: DateTime,
): void => {
	const dataView = dataViewFromHex(hex);
	const actual = dateTimeFromDataView(dataView);
	expect(actual, hex).eql(expected);
};

describe(DateTimeImpl.name, () => {
	test("from DataView", () => {
		/**
		 * @see Personal Health Devices Transcoding Whitepaper, §2.2.6
		 */
		testOne("DA070C120F1706", {
			day: 18,
			hours: 15,
			minutes: 23,
			month: 12,
			seconds: 6,
			year: 2010,
		});
	});
});
