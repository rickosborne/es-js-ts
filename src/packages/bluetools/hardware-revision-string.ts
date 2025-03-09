import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.hardware_revision_string.xml
/** <p>The value of this characteristic is a UTF-8 string representing the hardware revision for the hardware within the device.</p> */
export interface HardwareRevisionString {
    /** <p>Format: `utf8s`</p> */
    hardwareRevision: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.hardware_revision_string.xml | Hardware Revision String} */
export class HardwareRevisionStringImpl implements HardwareRevisionString {
    public static readonly UUID_PREFIX = 0x2a27;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.hardware_revision_string";
    public static readonly NAME = "Hardware Revision String";

    /** Parse from a DataView into {@link HardwareRevisionString}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): HardwareRevisionStringImpl {
        return new HardwareRevisionStringImpl(hardwareRevisionStringFromDataView(dataView, indexStart));
    }

    public readonly hardwareRevision: string;

    public constructor(hardwareRevisionString: HardwareRevisionString) {
        this.hardwareRevision = hardwareRevisionString.hardwareRevision;
    }
}

/** Parse from a DataView into {@link HardwareRevisionString}. */
export function hardwareRevisionStringFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): HardwareRevisionString {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const hardwareRevision = $dvr.utf8s();
    return { hardwareRevision };
}
