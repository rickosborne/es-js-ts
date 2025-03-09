import { expect } from "chai";
import { describe, test } from "mocha";
import { GATT_CHARACTERISTIC_ID, GATT_CHARACTERISTIC_UUID } from "../assigned.js";
import { btValueReaderFor } from "../bt-value-reader.js";
import { HeartRateMeasurementImpl } from "../heart-rate-measurement.js";

describe(btValueReaderFor.name, () => {
	test("id", () => {
		expect(btValueReaderFor(GATT_CHARACTERISTIC_ID.heart_rate_measurement)).eq(HeartRateMeasurementImpl);
	});
	test("uuid", () => {
		expect(btValueReaderFor(GATT_CHARACTERISTIC_UUID.heart_rate_measurement)).eq(HeartRateMeasurementImpl);
	});
	test("name", () => {
		expect(btValueReaderFor("heart_rate_measurement")).eq(HeartRateMeasurementImpl);
	});
	test("invalid", () => {
		expect(() => btValueReaderFor("measurement")).throws(Error, "More than one");
	});
});
