import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type ExactTime256, ExactTime256Impl } from "./exact-time-256.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.current_time.xml
export interface CurrentTime {
    /**
     * <p>Format: `8bit`</p>
     *
     * Bit field:
     *
     * | index | size | name |
     * | ----- | ---- | ---- |
     * | 0     | 1    | bit0 |
     * | 1     | 1    | bit1 |
     * | 2     | 1    | bit2 |
     * | 3     | 1    | bit3 |
     *
     */
    adjustReason: number;
    /**
     * | value | description           |
     * | ----- | --------------------- |
     * | 0     | No manual time update |
     * | 1     | Manual time update    |
     */
    bit0: number;
    /**
     * | value | description                       |
     * | ----- | --------------------------------- |
     * | 0     | No external reference time update |
     * | 1     | External reference time update    |
     */
    bit1: number;
    /**
     * | value | description            |
     * | ----- | ---------------------- |
     * | 0     | No change of time zone |
     * | 1     | Change of time zone    |
     */
    bit2: number;
    /**
     * | value | description                              |
     * | ----- | ---------------------------------------- |
     * | 0     | No change of DST (daylight savings time) |
     * | 1     | Change of DST (daylight savings time)    |
     */
    bit3: number;
    exactTime256: ExactTime256;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.current_time.xml | Current Time} */
export class CurrentTimeImpl implements CurrentTime {
    public static readonly UUID_PREFIX = 0x2a2b;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.current_time";
    public static readonly NAME = "Current Time";

    /** Parse from a DataView into {@link CurrentTime}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): CurrentTimeImpl {
        return new CurrentTimeImpl(currentTimeFromDataView(dataView, indexStart));
    }

    public readonly adjustReason: number;
    public readonly bit0: number;
    public readonly bit1: number;
    public readonly bit2: number;
    public readonly bit3: number;
    public readonly exactTime256: ExactTime256;

    public constructor(currentTime: CurrentTime) {
        this.adjustReason = currentTime.adjustReason;
        this.bit0 = currentTime.bit0;
        this.bit1 = currentTime.bit1;
        this.bit2 = currentTime.bit2;
        this.bit3 = currentTime.bit3;
        this.exactTime256 = currentTime.exactTime256;
    }
}

/** Parse from a DataView into {@link CurrentTime}. */
export function currentTimeFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): CurrentTime {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const exactTime256 = ExactTime256Impl.fromDataView($dvr);
    const adjustReason = $dvr.uint8();
    /**
     * | value | description           |
     * | ----- | --------------------- |
     * | 0     | No manual time update |
     * | 1     | Manual time update    |
     */
    const bit0 = adjustReason & 0b0000_0001;
    /**
     * | value | description                       |
     * | ----- | --------------------------------- |
     * | 0     | No external reference time update |
     * | 1     | External reference time update    |
     */
    const bit1 = (adjustReason & 0b0000_0010) >> 1;
    /**
     * | value | description            |
     * | ----- | ---------------------- |
     * | 0     | No change of time zone |
     * | 1     | Change of time zone    |
     */
    const bit2 = (adjustReason & 0b0000_0100) >> 2;
    /**
     * | value | description                              |
     * | ----- | ---------------------------------------- |
     * | 0     | No change of DST (daylight savings time) |
     * | 1     | Change of DST (daylight savings time)    |
     */
    const bit3 = (adjustReason & 0b0000_1000) >> 3;
    return { adjustReason, bit0, bit1, bit2, bit3, exactTime256 };
}
