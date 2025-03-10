import { expect } from "chai";
import { describe, test } from "mocha";
import { dataViewFromHex } from "../data-view-from-hex.js";
import { type TemperatureMeasurement, temperatureMeasurementFromDataView, TemperatureMeasurementImpl } from "../temperature-measurement.js";

const testOne = (
	hex: string,
	expected: TemperatureMeasurement,
): void => {
	const dataView = dataViewFromHex(hex);
	const actual = temperatureMeasurementFromDataView(dataView);
	expect(actual, hex).eql(expected);
};

describe(TemperatureMeasurementImpl.name, () => {
	test("Personal Health Devices Transcoding Whitepaper, §2.2.6", () => {
		testOne("006C0100FF", {
			flags: 0,
			temperatureMeasurementValueCelsius: 36.4,
			temperatureMeasurementValueFahrenheit: undefined,
			temperatureType: undefined,
			timeStamp: undefined,
		} satisfies TemperatureMeasurement);
	});
	test("Personal Health Devices Transcoding Whitepaper, §4.1", () => {
		testOne("02720100FFDA070C120F0000", {
			flags: 2,
			temperatureMeasurementValueCelsius: 37,
			temperatureMeasurementValueFahrenheit: undefined,
			temperatureType: undefined,
			timeStamp: {
				day: 18,
				hours: 15,
				minutes: 0,
				month: 12,
				seconds: 0,
				year: 2010,
			},
		} satisfies TemperatureMeasurement);
	});
});
