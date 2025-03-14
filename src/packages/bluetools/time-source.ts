import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.time_source.xml
export interface TimeSource {
    /**
     * <p>Format: `8bit`</p>
     * <p>Minimum: 0</p>
     * <p>Maximum: 7</p>
     * | Key | Description           |
     * | --- | --------------------- |
     * | 0   | Unknown               |
     * | 1   | Network Time Protocol |
     * | 2   | GPS                   |
     * | 3   | Radio Time Signal     |
     * | 4   | Manual                |
     * | 5   | Atomic Clock          |
     * | 6   | Cellular Network      |
     *
     * <p>Reserved for future use: 7 to 255</p>
     */
    timeSource: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.time_source.xml | Time Source} */
export class TimeSourceImpl implements TimeSource {
    public static readonly UUID_PREFIX = 0x2a13;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.time_source";
    public static readonly NAME = "Time Source";

    /** Parse from a DataView into {@link TimeSource}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): TimeSourceImpl {
        return new TimeSourceImpl(timeSourceFromDataView(dataView, indexStart));
    }

    public readonly timeSource: number;

    public constructor(timeSource: TimeSource) {
        this.timeSource = timeSource.timeSource;
    }
}

/** Parse from a DataView into {@link TimeSource}. */
export function timeSourceFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): TimeSource {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description           |
     * | ----- | --------------------- |
     * | 0     | Unknown               |
     * | 1     | Network Time Protocol |
     * | 2     | GPS                   |
     * | 3     | Radio Time Signal     |
     * | 4     | Manual                |
     * | 5     | Atomic Clock          |
     * | 6     | Cellular Network      |
     */
    const timeSource = $dvr.uint8();
    return { timeSource };
}
