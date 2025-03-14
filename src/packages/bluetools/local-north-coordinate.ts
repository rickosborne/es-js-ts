import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.local_north_coordinate.xml
/** <p>The Local North characteristic describes the North coordinate of the device using local coordinate system.</p> */
export interface LocalNorthCoordinate {
    /** <p>Format: `sint16`</p> */
    localNorthCoordinate: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.local_north_coordinate.xml | Local North Coordinate} */
export class LocalNorthCoordinateImpl implements LocalNorthCoordinate {
    public static readonly UUID_PREFIX = 0x2ab0;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.local_north_coordinate";
    public static readonly NAME = "Local North Coordinate";

    /** Parse from a DataView into {@link LocalNorthCoordinate}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): LocalNorthCoordinateImpl {
        return new LocalNorthCoordinateImpl(localNorthCoordinateFromDataView(dataView, indexStart));
    }

    public readonly localNorthCoordinate: number;

    public constructor(localNorthCoordinate: LocalNorthCoordinate) {
        this.localNorthCoordinate = localNorthCoordinate.localNorthCoordinate;
    }
}

/** Parse from a DataView into {@link LocalNorthCoordinate}. */
export function localNorthCoordinateFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): LocalNorthCoordinate {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const localNorthCoordinate = $dvr.int16();
    return { localNorthCoordinate };
}
