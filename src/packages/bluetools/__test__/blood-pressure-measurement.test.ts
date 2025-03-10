import { expect } from "chai";
import { describe, test } from "mocha";
import { type BloodPressureMeasurement, bloodPressureMeasurementFromDataView, BloodPressureMeasurementImpl } from "../blood-pressure-measurement.js";
import { dataViewFromHex } from "../data-view-from-hex.js";

const testOne = (
	hex: string,
	expected: BloodPressureMeasurement,
): void => {
	const dataView = dataViewFromHex(hex);
	const actual = bloodPressureMeasurementFromDataView(dataView);
	expect(actual, hex).eql(expected);
};

describe(BloodPressureMeasurementImpl.name, () => {
	test("from DataView", () => {
		/**
		 * @see Personal Health Devices Transcoding Whitepaper, §2.2.6
		 */
		testOne("00720072007200", {
			bloodPressureMeasurementCompoundValueSystolicMmHg: 114,
			bloodPressureMeasurementCompoundValueDiastolicMmHg: 114,
			bloodPressureMeasurementCompoundValueSystolicKPa: undefined,
			bloodPressureMeasurementCompoundValueDiastolicKPa: undefined,
			bloodPressureMeasurementCompoundValueMeanArterialPressureKPa: undefined,
			bloodPressureMeasurementCompoundValueMeanArterialPressureMmHg: 114,
			bodyMovementDetectionFlag: 0,
			cuffFitDetectionFlag: 0,
			flags: 0,
			irregularPulseDetectionFlag: 0,
			measurementPositionDetectionFlag: 0,
			measurementStatus: 0,
			pulseRate: undefined,
			pulseRateRangeDetectionFlags: 0,
			timeStamp: undefined,
			userID: undefined,
		} satisfies BloodPressureMeasurement);
	});
});
