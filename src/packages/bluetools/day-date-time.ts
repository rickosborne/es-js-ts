import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type DateTime, DateTimeImpl } from "./date-time.js";
import { type DayOfWeek, DayOfWeekImpl } from "./day-of-week.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.day_date_time.xml
export interface DayDateTime {
    dateTime: DateTime;
    dayOfWeek: DayOfWeek;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.day_date_time.xml | Day Date Time} */
export class DayDateTimeImpl implements DayDateTime {
    public static readonly UUID_PREFIX = 0x2a0a;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.day_date_time";
    public static readonly NAME = "Day Date Time";

    /** Parse from a DataView into {@link DayDateTime}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): DayDateTimeImpl {
        return new DayDateTimeImpl(dayDateTimeFromDataView(dataView, indexStart));
    }

    public readonly dateTime: DateTime;
    public readonly dayOfWeek: DayOfWeek;

    public constructor(dayDateTime: DayDateTime) {
        this.dateTime = dayDateTime.dateTime;
        this.dayOfWeek = dayDateTime.dayOfWeek;
    }
}

/** Parse from a DataView into {@link DayDateTime}. */
export function dayDateTimeFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): DayDateTime {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const dateTime = DateTimeImpl.fromDataView($dvr);
    const dayOfWeek = DayOfWeekImpl.fromDataView($dvr);
    return { dateTime, dayOfWeek };
}
