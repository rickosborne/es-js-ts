import { expect } from "chai";
import { describe, test } from "mocha";
import { gatt, gattCharacteristicName, gattDescriptorName, gattServiceName, isGattCharacteristicName, isGattDescriptorName, isGattServiceName } from "../gatt.js";

describe("GATT", () => {
	test("Service", () => {
		expect(isGattServiceName("heart_rate")).eq(true);
		expect(gattServiceName("heart_rate")).eq("heart_rate");
		expect(gattServiceName(gatt.service.heart_rate.value), "value").eq("heart_rate");
		expect(gattServiceName(gatt.service.heart_rate.label), "label").eq("heart_rate");
		expect(gattServiceName(gatt.service.heart_rate.name), "name").eq("heart_rate");
		expect(gattServiceName(gatt.service.heart_rate.uuid), "uuid").eq("heart_rate");
		expect(gattServiceName(gatt.service.heart_rate.hex), "hex").eq("heart_rate");
		expect(isGattServiceName("gate_address")).eq(false);
		expect(gattServiceName(null)).is.undefined;
		expect(gattServiceName(undefined)).is.undefined;
		expect(gattServiceName("gate_address")).is.undefined;
		expect(gatt.service.heart_rate.uuid, "uuid").eq("0000180d-0000-1000-8000-00805f9b34fb");
		expect(gatt.service.heart_rate.value, "value").eq(6157);
	});
	test("Characteristic", () => {
		expect(isGattCharacteristicName("heart_rate_measurement")).eq(true);
		expect(gattCharacteristicName("heart_rate_measurement")).eq("heart_rate_measurement");
		expect(gattCharacteristicName(gatt.characteristic.heart_rate_measurement.value), "value").eq("heart_rate_measurement");
		expect(gattCharacteristicName(gatt.characteristic.heart_rate_measurement.label), "label").eq("heart_rate_measurement");
		expect(gattCharacteristicName(gatt.characteristic.heart_rate_measurement.name), "name").eq("heart_rate_measurement");
		expect(gattCharacteristicName(gatt.characteristic.heart_rate_measurement.uuid), "uuid").eq("heart_rate_measurement");
		expect(gattCharacteristicName(gatt.characteristic.heart_rate_measurement.hex), "hex").eq("heart_rate_measurement");
		expect(isGattCharacteristicName("gate_address")).eq(false);
		expect(gattCharacteristicName(null)).is.undefined;
		expect(gattCharacteristicName(undefined)).is.undefined;
		expect(gattCharacteristicName("gate_address")).is.undefined;
	});
	test("Descriptor", () => {
		expect(isGattDescriptorName("valid_range")).eq(true);
		expect(gattDescriptorName("valid_range")).eq("valid_range");
		expect(gattDescriptorName(gatt.descriptor.valid_range.label), "label").eq("valid_range");
		expect(gattDescriptorName(gatt.descriptor.valid_range.value), "value").eq("valid_range");
		expect(gattDescriptorName(gatt.descriptor.valid_range.name), "name").eq("valid_range");
		expect(gattDescriptorName(gatt.descriptor.valid_range.uuid), "uuid").eq("valid_range");
		expect(gattDescriptorName(gatt.descriptor.valid_range.hex), "hex").eq("valid_range");
		expect(isGattDescriptorName("gate_address")).eq(false);
		expect(gattDescriptorName(null)).is.undefined;
		expect(gattDescriptorName(undefined)).is.undefined;
		expect(gattDescriptorName("gate_address")).is.undefined;
	});
});
