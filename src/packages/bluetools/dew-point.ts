import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.dew_point.xml
export interface DewPoint {
    /**
     * <p>Format: `sint8`</p>
     * <p>Unit: `org.bluetooth.unit.thermodynamic_temperature.degree_celsius`</p>
     * <p>Unit is in degrees celsius with a resolution of 1 degree Celsius</p>
     */
    dewPoint: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.dew_point.xml | Dew Point} */
export class DewPointImpl implements DewPoint {
    public static readonly UUID_PREFIX = 0x2a7b;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.dew_point";
    public static readonly NAME = "Dew Point";

    /** Parse from a DataView into {@link DewPoint}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): DewPointImpl {
        return new DewPointImpl(dewPointFromDataView(dataView, indexStart));
    }

    public readonly dewPoint: number;

    public constructor(dewPoint: DewPoint) {
        this.dewPoint = dewPoint.dewPoint;
    }
}

/** Parse from a DataView into {@link DewPoint}. */
export function dewPointFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): DewPoint {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const dewPoint = $dvr.int8();
    return { dewPoint };
}
