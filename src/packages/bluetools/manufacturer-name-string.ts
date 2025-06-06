import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.manufacturer_name_string.xml
/** <p>The value of this characteristic is a UTF-8 string representing the name of the manufacturer of the device.</p> */
export interface ManufacturerNameString {
    /** <p>Format: `utf8s`</p> */
    manufacturerName: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.manufacturer_name_string.xml | Manufacturer Name String} */
export class ManufacturerNameStringImpl implements ManufacturerNameString {
    public static readonly UUID_PREFIX = 0x2a29;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.manufacturer_name_string";
    public static readonly NAME = "Manufacturer Name String";

    /** Parse from a DataView into {@link ManufacturerNameString}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): ManufacturerNameStringImpl {
        return new ManufacturerNameStringImpl(manufacturerNameStringFromDataView(dataView, indexStart));
    }

    public readonly manufacturerName: string;

    public constructor(manufacturerNameString: ManufacturerNameString) {
        this.manufacturerName = manufacturerNameString.manufacturerName;
    }
}

/** Parse from a DataView into {@link ManufacturerNameString}. */
export function manufacturerNameStringFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): ManufacturerNameString {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const manufacturerName = $dvr.utf8s();
    return { manufacturerName };
}
