import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.fat_burn_heart_rate_lower_limit.xml
/** <p>Lower limit of the heart rate where the user maximizes the fat burn while exersizing</p> */
export interface FatBurnHeartRateLowerLimit {
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.period.beats_per_minute`</p>
     * <p>Unit is in beats per minute with a resolution of 1</p>
     */
    fatBurnHeartRateLowerLimit: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.fat_burn_heart_rate_lower_limit.xml | Fat Burn Heart Rate Lower Limit} */
export class FatBurnHeartRateLowerLimitImpl implements FatBurnHeartRateLowerLimit {
    public static readonly UUID_PREFIX = 0x2a88;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.fat_burn_heart_rate_lower_limit";
    public static readonly NAME = "Fat Burn Heart Rate Lower Limit";

    /** Parse from a DataView into {@link FatBurnHeartRateLowerLimit}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): FatBurnHeartRateLowerLimitImpl {
        return new FatBurnHeartRateLowerLimitImpl(fatBurnHeartRateLowerLimitFromDataView(dataView, indexStart));
    }

    public readonly fatBurnHeartRateLowerLimit: number;

    public constructor(fatBurnHeartRateLowerLimit: FatBurnHeartRateLowerLimit) {
        this.fatBurnHeartRateLowerLimit = fatBurnHeartRateLowerLimit.fatBurnHeartRateLowerLimit;
    }
}

/** Parse from a DataView into {@link FatBurnHeartRateLowerLimit}. */
export function fatBurnHeartRateLowerLimitFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): FatBurnHeartRateLowerLimit {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const fatBurnHeartRateLowerLimit = $dvr.uint8();
    return { fatBurnHeartRateLowerLimit };
}
