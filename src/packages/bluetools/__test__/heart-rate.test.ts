import { entriesOf } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, test } from "mocha";
import { dataViewFromHex } from "../data-view-from-hex.js";
import { type HeartRateMeasurement, heartRateMeasurementFromDataView, HeartRateMeasurementImpl } from "../heart-rate-measurement.js";
import { parseHeartRate } from "../heart-rate.js";

const examples: Record<string, HeartRateMeasurement> = {
	"103fe803": {
		bpm: 63,
		flags: 0b0001_0000,
		rrInterval: [
			1000,
		],
		sensorContact: 0,
	},
	"103fc603": {
		bpm: 63,
		flags: 0b0001_0000,
		rrInterval: [
			966,
		],
		sensorContact: 0,
	},
	"103fd203": {
		bpm: 63,
		flags: 0b0001_0000,
		rrInterval: [
			978,
		],
		sensorContact: 0,
	},
};

describe("heart-rate", () => {
	test(parseHeartRate.name, () => {
		for (const [ hex, expected ] of entriesOf(examples)) {
			expect(parseHeartRate(hex)).eql(expected);
		}
	});
	test(heartRateMeasurementFromDataView.name, () => {
		for (const [ hex, expected ] of entriesOf(examples)) {
			expect(heartRateMeasurementFromDataView(dataViewFromHex(hex))).eql({
				energyJ: undefined,
				...expected,
			});
		}
	});
	test(HeartRateMeasurementImpl.name, () => {
		for (const [ hex, expected ] of entriesOf(examples)) {
			expect(HeartRateMeasurementImpl.fromDataView(dataViewFromHex(hex))).eql({
				energyJ: undefined,
				...expected,
			});
		}
	});
});
