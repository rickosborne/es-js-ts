import { entriesOf, zeroPad } from "@rickosborne/foundation";
import { GATT_CHARACTERISTIC_TABLE, GATT_DESCRIPTOR_TABLE, GATT_SERVICE_TABLE } from "./assigned.js";

export type GattName = GattServiceName | GattCharacteristicName | GattDescriptorName;
export type GattTableValues = readonly [ value: number, label: string | undefined ];
export type GattIdsTable<T extends GattName> = Record<T, GattTableValues>;
export type GattServiceName = keyof typeof GATT_SERVICE_TABLE;
export type GattCharacteristicName = keyof typeof GATT_CHARACTERISTIC_TABLE;
export type GattDescriptorName = keyof typeof GATT_DESCRIPTOR_TABLE;

/**
 * Convert the given value to hex and wrap it in a full UUID format.
 */
export const gattUuidFromValue = (num: number): string => {
	return zeroPad(num, 8, 16).concat("-0000-1000-8000-00805f9b34fb");
};

/**
 * Consolidated metadata for an assigned Service, Characteristic, or Descriptor.
 */
export interface GattNamedDetails {
	/**
	 * String-formatted version of `value`, zero-padded to 4 characters, but without a leading "0x".
	 * @example
	 * "2a37"
	 */
	readonly hex: string;
	/**
	 * Human-readable descriptive label for the value.
	 * @example
	 * "Heart Rate Measurement"
	 */
	readonly label: string | undefined;
	/**
	 * Key for the value, usually snake-case formatted.
	 * @example
	 * "heart_rate_measurement"
	 */
	readonly name: string;
	/**
	 * Full 36-character UUID, with all-lowercase hex characters.
	 * @example
	 * "0000180d-0000-1000-8000-00805f9b34fb"
	 */
	readonly uuid: string;
	/**
	 * Assigned numeric ID, without formatting.
	 * @example
	 * 6157
	 */
	readonly value: number;
}

type TableAccessor<N extends GattName> = Record<N, GattNamedDetails>;

const gattGuards = <N extends GattName>(
	name: string,
	table: GattIdsTable<N>,
	namespace: string,
): { isGuard: (value: unknown) => value is N; converter: (idOrName: string | number | null | undefined) => N | undefined; } => {
	const guardName = `isGatt${ name }Name`;
	const isGuard: (value: unknown) => value is N = {
		[ guardName ]: (value: unknown): value is N => typeof value === "string" && table[ value as N ] != null,
	}[ guardName ]!;
	const converterName = `isGatt${ name }Name`;
	let nameByValue: Map<number, N> | undefined = undefined;
	let nameByUuid: Map<string, N> | undefined = undefined;
	let nameByLabel: Map<string, N> | undefined = undefined;
	let nameByHex: Map<string, N> | undefined = undefined;
	const converter: (idOrName: string | number | null | undefined) => N | undefined = {
		[ converterName ]: (idOrName: string | number | null | undefined): N | undefined => {
			if (idOrName == null) {
				return undefined;
			}
			if (typeof idOrName === "number") {
				nameByValue ??= new Map(entriesOf(table).map(([ name, [ id ] ]) => [ id, name ]));
				return nameByValue.get(idOrName);
			}
			let text: string = idOrName;
			if (text.startsWith(namespace)) {
				text = text.replace(namespace, "");
			}
			if (isGuard(text)) {
				return text;
			}
			nameByUuid ??= new Map(entriesOf(table).map(([ name, [ value ] ]) => [ gattUuidFromValue(value), name ]));
			const fromUuid: N | undefined = nameByUuid.get(text);
			if (fromUuid != null) {
				return fromUuid;
			}
			nameByLabel ??= new Map(entriesOf(table).filter(([ _name, [ , label ] ]) => label != null).map(([ name, [ , label ] ]) => [ label!, name ]));
			const fromLabel = nameByLabel.get(text);
			if (fromLabel != null) {
				return fromLabel;
			}
			nameByHex ??= new Map(entriesOf(table).map(([ name, [ value ] ]) => [ zeroPad(value, 4, 16), name ]));
			return nameByHex.get(text);
		},
	}[ converterName ]!;
	return { isGuard, converter };
};

export const { isGuard: isGattServiceName, converter: gattServiceName } = gattGuards<GattServiceName>("Service", GATT_SERVICE_TABLE, "org.bluetooth.service.");
export const { isGuard: isGattCharacteristicName, converter: gattCharacteristicName } = gattGuards<GattCharacteristicName>("Characteristic", GATT_CHARACTERISTIC_TABLE, "org.bluetooth.characteristic.");
export const { isGuard: isGattDescriptorName, converter: gattDescriptorName } = gattGuards<GattDescriptorName>("Descriptor", GATT_DESCRIPTOR_TABLE, "org.bluetooth.descriptor.");

const tableAccessor = <N extends GattName>(table: GattIdsTable<N>): TableAccessor<N> => {
	return new Proxy<TableAccessor<N>>({} as TableAccessor<N>, {
		get(_t1: TableAccessor<N>, name: string): undefined | GattNamedDetails {
			const data = table[ name as N ];
			if (data == null) {
				return undefined;
			}
			const [ value, label ] = data;
			let hex: string | undefined;
			let uuid: string | undefined;
			return {
				get hex(): string {
					hex ??= zeroPad(value, 4, 16);
					return hex;
				},
				label,
				name,
				value,
				get uuid(): string {
					uuid ??= gattUuidFromValue(value);
					return uuid;
				},
			};
		},
	});
};

/**
 * Helper for accessing the various assigned numbers/values and their metadata.
 */
export const gatt: {
	characteristic: TableAccessor<GattCharacteristicName>,
	descriptor: TableAccessor<GattDescriptorName>,
	service: TableAccessor<GattServiceName>,
} = {
	characteristic: tableAccessor(GATT_CHARACTERISTIC_TABLE),
	descriptor: tableAccessor(GATT_DESCRIPTOR_TABLE),
	service: tableAccessor(GATT_SERVICE_TABLE),
};
