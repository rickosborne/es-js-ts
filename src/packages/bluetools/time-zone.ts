import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.time_zone.xml
export interface TimeZone {
    /**
     * <p>Offset from UTC in number of 15 minutes increments. A value of -128 means that the time zone offset is not known. The offset defined in this characteristic is constant, regardless whether daylight savings is in effect.</p>
     * <p>Format: `sint8`</p>
     * <p>Minimum: -48</p>
     * <p>Maximum: 56</p>
     */
    timeZone: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.time_zone.xml | Time Zone} */
export class TimeZoneImpl implements TimeZone {
    public static readonly UUID_PREFIX = 0x2a0e;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.time_zone";
    public static readonly NAME = "Time Zone";

    /** Parse from a DataView into {@link TimeZone}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): TimeZoneImpl {
        return new TimeZoneImpl(timeZoneFromDataView(dataView, indexStart));
    }

    public readonly timeZone: number;

    public constructor(timeZone: TimeZone) {
        this.timeZone = timeZone.timeZone;
    }
}

/** Parse from a DataView into {@link TimeZone}. */
export function timeZoneFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): TimeZone {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const timeZone = $dvr.int8();
    return { timeZone };
}
