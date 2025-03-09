import { expect } from "chai";
import { describe, test } from "mocha";
import { GATT_CHARACTERISTIC_ID, GATT_CHARACTERISTIC_UUID, GATT_DESCRIPTOR_ID, GATT_DESCRIPTOR_UUID, GATT_SERVICE_ID, GATT_SERVICE_UUID } from "../assigned.js";
import { gattCharacteristicName, gattDescriptorName, gattServiceName, isGattCharacteristicName, isGattDescriptorName, isGattServiceName } from "../gatt.js";

describe("GATT", () => {
	test("Service", () => {
		expect(isGattServiceName("heart_rate")).eq(true);
		expect(gattServiceName("heart_rate")).eq("heart_rate");
		expect(gattServiceName(GATT_SERVICE_UUID.heart_rate)).eq("heart_rate");
		expect(gattServiceName(GATT_SERVICE_ID.heart_rate)).eq("heart_rate");
		expect(isGattServiceName("gate_address")).eq(false);
		expect(gattServiceName(null)).is.undefined;
		expect(gattServiceName(undefined)).is.undefined;
		expect(gattServiceName("gate_address")).is.undefined;
	});
	test("Characteristic", () => {
		expect(isGattCharacteristicName("heart_rate_measurement")).eq(true);
		expect(gattCharacteristicName("heart_rate_measurement")).eq("heart_rate_measurement");
		expect(gattCharacteristicName(GATT_CHARACTERISTIC_UUID.heart_rate_measurement)).eq("heart_rate_measurement");
		expect(gattCharacteristicName(GATT_CHARACTERISTIC_ID.heart_rate_measurement)).eq("heart_rate_measurement");
		expect(isGattCharacteristicName("gate_address")).eq(false);
		expect(gattCharacteristicName(null)).is.undefined;
		expect(gattCharacteristicName(undefined)).is.undefined;
		expect(gattCharacteristicName("gate_address")).is.undefined;
	});
	test("Descriptor", () => {
		expect(isGattDescriptorName("valid_range")).eq(true);
		expect(gattDescriptorName("valid_range")).eq("valid_range");
		expect(gattDescriptorName(GATT_DESCRIPTOR_UUID.valid_range)).eq("valid_range");
		expect(gattDescriptorName(GATT_DESCRIPTOR_ID.valid_range)).eq("valid_range");
		expect(isGattDescriptorName("gate_address")).eq(false);
		expect(gattDescriptorName(null)).is.undefined;
		expect(gattDescriptorName(undefined)).is.undefined;
		expect(gattDescriptorName("gate_address")).is.undefined;
	});
});
