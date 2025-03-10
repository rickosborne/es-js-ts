import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
/**
 * <p>The Client Characteristic Configuration descriptor defines how the characteristic may be configured by a specific client.</p>
 * <p>This descriptor shall be persistent across connections for bonded devices. The Client Characteristic Configuration descriptor is unique for each client. A client may read and write this descriptor to determine and set the configuration for that client. Authentication and authorization may be required by the server to write this descriptor. The default value for the Client Characteristic Configuration descriptor is 0x00. Upon connection of non-binded clients, this descriptor is set to the default value.</p>
 */
export interface GattClientCharacteristicConfiguration {
    /**
     * | value | description            |
     * | ----- | ---------------------- |
     * | 0     | Notifications disabled |
     * | 1     | Notifications enabled  |
     */
    bit0: number;
    /**
     * | value | description          |
     * | ----- | -------------------- |
     * | 0     | Indications disabled |
     * | 1     | Indications enabled  |
     */
    bit1: number;
    /**
     * <p>Format: `16bit`</p>
     * <p>Minimum: 0</p>
     * <p>Maximum: 3</p>
     *
     * Bit field:
     *
     * | index | size | name                    |
     * | ----- | ---- | ----------------------- |
     * | 0     | 1    | bit0                    |
     * | 1     | 1    | bit1                    |
     * | 0     | 0    | Reserved for future use |
     *
     */
    properties: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml | Gatt Client Characteristic Configuration} */
export class GattClientCharacteristicConfigurationImpl implements GattClientCharacteristicConfiguration {
    public static readonly UUID_PREFIX = 0x2902;
    public static readonly TYPE_NAME = "org.bluetooth.descriptor.gatt.client_characteristic_configuration";
    public static readonly NAME = "Client Characteristic Configuration";

    /** Parse from a DataView into {@link GattClientCharacteristicConfiguration}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): GattClientCharacteristicConfigurationImpl {
        return new GattClientCharacteristicConfigurationImpl(gattClientCharacteristicConfigurationFromDataView(dataView, indexStart));
    }

    public readonly bit0: number;
    public readonly bit1: number;
    public readonly properties: number;

    public constructor(gattClientCharacteristicConfiguration: GattClientCharacteristicConfiguration) {
        this.bit0 = gattClientCharacteristicConfiguration.bit0;
        this.bit1 = gattClientCharacteristicConfiguration.bit1;
        this.properties = gattClientCharacteristicConfiguration.properties;
    }
}

/** Parse from a DataView into {@link GattClientCharacteristicConfiguration}. */
export function gattClientCharacteristicConfigurationFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): GattClientCharacteristicConfiguration {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const properties = $dvr.uint16();
    /**
     * | value | description            |
     * | ----- | ---------------------- |
     * | 0     | Notifications disabled |
     * | 1     | Notifications enabled  |
     */
    const bit0 = properties & 0b0000_0000_0000_0001;
    /**
     * | value | description          |
     * | ----- | -------------------- |
     * | 0     | Indications disabled |
     * | 1     | Indications enabled  |
     */
    const bit1 = (properties & 0b0000_0000_0000_0010) >> 1;
    return { bit0, bit1, properties };
}
