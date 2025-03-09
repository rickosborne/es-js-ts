import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.longitude.xml
/** <p>The Longitude characteristic describes the WGS84 East coordinate of the device.</p> */
export interface Longitude {
    /** <p>Format: `sint32`</p> */
    longitude: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.longitude.xml | Longitude} */
export class LongitudeImpl implements Longitude {
    public static readonly UUID_PREFIX = 0x2aaf;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.Longitude";
    public static readonly NAME = "Longitude";

    /** Parse from a DataView into {@link Longitude}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): LongitudeImpl {
        return new LongitudeImpl(longitudeFromDataView(dataView, indexStart));
    }

    public readonly longitude: number;

    public constructor(longitude: Longitude) {
        this.longitude = longitude.longitude;
    }
}

/** Parse from a DataView into {@link Longitude}. */
export function longitudeFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Longitude {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const longitude = $dvr.int32();
    return { longitude };
}
