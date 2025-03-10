import { expect } from "chai";
import { describe, test } from "mocha";
import { currentTimeFromDataView, CurrentTimeImpl } from "../current-time.js";
import { dataViewFromHex } from "../data-view-from-hex.js";

const testOne = (
	hex: string,
	expected: CurrentTimeImpl,
): void => {
	const dataView = dataViewFromHex(hex);
	const actual = currentTimeFromDataView(dataView);
	expect(actual, hex).eql(expected);
};

describe(CurrentTimeImpl.name, () => {
	test("from DataView", () => {
		/**
		 * @see Personal Health Devices Transcoding Whitepaper, §2.2.6
		 */
		testOne("DA070C120F170600C000", {
			adjustReason: 0,
			bit0: 0,
			bit1: 0,
			bit2: 0,
			bit3: 0,
			exactTime256: {
				dayDateTime: {
					dateTime: {
						day: 18,
						hours: 15,
						minutes: 23,
						month: 12,
						seconds: 6,
						year: 2010,
					},
					dayOfWeek: {
						dayOfWeek: 0,
					},
				},
				fractions256: 192, // (256 * 0.75),
			},
		});
	});
});
