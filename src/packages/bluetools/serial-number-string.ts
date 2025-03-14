import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.serial_number_string.xml
/** <p>The value of this characteristic is a variable-length UTF-8 string representing the serial number for a particular instance of the device.</p> */
export interface SerialNumberString {
    /** <p>Format: `utf8s`</p> */
    serialNumber: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.serial_number_string.xml | Serial Number String} */
export class SerialNumberStringImpl implements SerialNumberString {
    public static readonly UUID_PREFIX = 0x2a25;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.serial_number_string";
    public static readonly NAME = "Serial Number String";

    /** Parse from a DataView into {@link SerialNumberString}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): SerialNumberStringImpl {
        return new SerialNumberStringImpl(serialNumberStringFromDataView(dataView, indexStart));
    }

    public readonly serialNumber: string;

    public constructor(serialNumberString: SerialNumberString) {
        this.serialNumber = serialNumberString.serialNumber;
    }
}

/** Parse from a DataView into {@link SerialNumberString}. */
export function serialNumberStringFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): SerialNumberString {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const serialNumber = $dvr.utf8s();
    return { serialNumber };
}
