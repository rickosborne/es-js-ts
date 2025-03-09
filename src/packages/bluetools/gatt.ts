import { GATT_CHARACTERISTIC_ID, GATT_CHARACTERISTIC_UUID, GATT_DESCRIPTOR_ID, GATT_DESCRIPTOR_UUID, GATT_SERVICE_ID, GATT_SERVICE_UUID, type GattCharacteristicName, type GattDescriptorName, type GattServiceName } from "./assigned.js";

const gattGuards = <N extends string>(
	name: string,
	uuids: {[K in N]: string},
	ids: {[K in N]: number},
): { isGuard: (value: unknown) => value is N; converter: (idOrName: string | number | null | undefined) => N | undefined; } => {
	const guardName = `isGatt${name}Name`;
	const isGuard: (value: unknown) => value is N = {
		[guardName]: (value: unknown): value is N => typeof value === "string" && typeof uuids[value as N] === "string",
	}[guardName]!;
	const converterName = `isGatt${name}Name`;
	const converter: (idOrName: string | number | null | undefined) => N | undefined = {
		[converterName]: (idOrName: string | number | null | undefined): N | undefined => {
			if (idOrName == null) {
				return undefined;
			}
			if (isGuard(idOrName)) {
				return idOrName;
			}
			if (typeof idOrName === "string") {
				return Object.entries(uuids).find(([ _name, uuid ]) => uuid === idOrName)?.at(0) as N | undefined;
			}
			return Object.entries(ids).find(([ _name, id ]) => id === idOrName)?.at(0) as N | undefined;
		},
	}[converterName]!;
	return { isGuard, converter };
};

export const { isGuard: isGattServiceName, converter: gattServiceName } = gattGuards<GattServiceName>("Service", GATT_SERVICE_UUID, GATT_SERVICE_ID);
export const { isGuard: isGattCharacteristicName, converter: gattCharacteristicName } = gattGuards<GattCharacteristicName>("Characteristic", GATT_CHARACTERISTIC_UUID, GATT_CHARACTERISTIC_ID);
export const { isGuard: isGattDescriptorName, converter: gattDescriptorName } = gattGuards<GattDescriptorName>("Descriptor", GATT_DESCRIPTOR_UUID, GATT_DESCRIPTOR_ID);
