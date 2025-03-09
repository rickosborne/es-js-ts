import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.heart_rate_max.xml
/** <p>Maximum heart rate a user can reach.</p> */
export interface HeartRateMax {
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.period.beats_per_minute`</p>
     * <p>Unit is in beats per minute with a resolution of 1.</p>
     */
    heartRateMax: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.heart_rate_max.xml | Heart Rate Max} */
export class HeartRateMaxImpl implements HeartRateMax {
    public static readonly UUID_PREFIX = 0x2a8d;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.heart_rate_max";
    public static readonly NAME = "Heart Rate Max";

    /** Parse from a DataView into {@link HeartRateMax}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): HeartRateMaxImpl {
        return new HeartRateMaxImpl(heartRateMaxFromDataView(dataView, indexStart));
    }

    public readonly heartRateMax: number;

    public constructor(heartRateMax: HeartRateMax) {
        this.heartRateMax = heartRateMax.heartRateMax;
    }
}

/** Parse from a DataView into {@link HeartRateMax}. */
export function heartRateMaxFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): HeartRateMax {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const heartRateMax = $dvr.uint8();
    return { heartRateMax };
}
