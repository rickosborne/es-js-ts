import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.true_wind_direction.xml
export interface TrueWindDirection {
    /**
     * <p>Wind direction is reported by the direction from which it originates and is an angle measured clockwise relative to Geographic North. For example, a wind coming from the north is given as 0 degrees, a wind coming from the south is given as 180 degrees, a wind coming from the east is given as 90 degrees and a wind coming from the west is given as 270 degrees.</p>
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.plane_angle.degree`</p>
     * <p>Unit is in degrees with a resolution of 0.01 degrees</p>
     * <p>Minimum: 0</p>
     * <p>Maximum: 359.99</p>
     */
    trueWindDirection: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.true_wind_direction.xml | True Wind Direction} */
export class TrueWindDirectionImpl implements TrueWindDirection {
    public static readonly UUID_PREFIX = 0x2a71;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.true_wind_direction";
    public static readonly NAME = "True Wind Direction";

    /** Parse from a DataView into {@link TrueWindDirection}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): TrueWindDirectionImpl {
        return new TrueWindDirectionImpl(trueWindDirectionFromDataView(dataView, indexStart));
    }

    public readonly trueWindDirection: number;

    public constructor(trueWindDirection: TrueWindDirection) {
        this.trueWindDirection = trueWindDirection.trueWindDirection;
    }
}

/** Parse from a DataView into {@link TrueWindDirection}. */
export function trueWindDirectionFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): TrueWindDirection {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const trueWindDirection = $dvr.uint16();
    return { trueWindDirection };
}
