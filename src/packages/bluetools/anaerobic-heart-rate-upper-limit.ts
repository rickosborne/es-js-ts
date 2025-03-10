import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.anaerobic_heart_rate_upper_limit.xml
/** <p>Upper limit of the heart rate where the user enhances his anaerobic tolerance while exercising.</p> */
export interface AnaerobicHeartRateUpperLimit {
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.period.beats_per_minute`</p>
     * <p>Unit is in beats per minute with a resolution of 1</p>
     */
    anaerobicHeartRateUpperLimit: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.anaerobic_heart_rate_upper_limit.xml | Anaerobic Heart Rate Upper Limit} */
export class AnaerobicHeartRateUpperLimitImpl implements AnaerobicHeartRateUpperLimit {
    public static readonly UUID_PREFIX = 0x2a82;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.anaerobic_heart_rate_upper_limit";
    public static readonly NAME = "Anaerobic Heart Rate Upper Limit";

    /** Parse from a DataView into {@link AnaerobicHeartRateUpperLimit}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): AnaerobicHeartRateUpperLimitImpl {
        return new AnaerobicHeartRateUpperLimitImpl(anaerobicHeartRateUpperLimitFromDataView(dataView, indexStart));
    }

    public readonly anaerobicHeartRateUpperLimit: number;

    public constructor(anaerobicHeartRateUpperLimit: AnaerobicHeartRateUpperLimit) {
        this.anaerobicHeartRateUpperLimit = anaerobicHeartRateUpperLimit.anaerobicHeartRateUpperLimit;
    }
}

/** Parse from a DataView into {@link AnaerobicHeartRateUpperLimit}. */
export function anaerobicHeartRateUpperLimitFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): AnaerobicHeartRateUpperLimit {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const anaerobicHeartRateUpperLimit = $dvr.uint8();
    return { anaerobicHeartRateUpperLimit };
}
