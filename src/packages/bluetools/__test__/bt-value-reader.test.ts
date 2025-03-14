import { expect } from "chai";
import { describe, test } from "mocha";
import { AgeImpl } from "../age.js";
import { btValueReaderFor } from "../bt-value-reader.js";
import { gatt } from "../gatt.js";
import { HeartRateMeasurementImpl } from "../heart-rate-measurement.js";

describe(btValueReaderFor.name, () => {
	test("id", () => {
		expect(btValueReaderFor(gatt.characteristic.heart_rate_measurement.uuid)).eq(HeartRateMeasurementImpl);
	});
	test("uuid", () => {
		expect(btValueReaderFor(gatt.characteristic.heart_rate_measurement.uuid)).eq(HeartRateMeasurementImpl);
	});
	test("name", () => {
		expect(btValueReaderFor("heart_rate_measurement")).eq(HeartRateMeasurementImpl);
	});
	test("invalid", () => {
		expect(btValueReaderFor("measurement")).eq(undefined);
	});
	test("age", () => {
		expect(btValueReaderFor("age")).eq(AgeImpl);
	});
});
