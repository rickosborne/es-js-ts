import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type TimeZone, TimeZoneImpl } from "./time-zone.js";
import { type DstOffset, DstOffsetImpl } from "./dst-offset.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.local_time_information.xml
export interface LocalTimeInformation {
    daylightSavingTime: DstOffset;
    timeZone: TimeZone;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.local_time_information.xml | Local Time Information} */
export class LocalTimeInformationImpl implements LocalTimeInformation {
    public static readonly UUID_PREFIX = 0x2a0f;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.local_time_information";
    public static readonly NAME = "Local Time Information";

    /** Parse from a DataView into {@link LocalTimeInformation}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): LocalTimeInformationImpl {
        return new LocalTimeInformationImpl(localTimeInformationFromDataView(dataView, indexStart));
    }

    public readonly daylightSavingTime: DstOffset;
    public readonly timeZone: TimeZone;

    public constructor(localTimeInformation: LocalTimeInformation) {
        this.daylightSavingTime = localTimeInformation.daylightSavingTime;
        this.timeZone = localTimeInformation.timeZone;
    }
}

/** Parse from a DataView into {@link LocalTimeInformation}. */
export function localTimeInformationFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): LocalTimeInformation {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const timeZone = TimeZoneImpl.fromDataView($dvr);
    const daylightSavingTime = DstOffsetImpl.fromDataView($dvr);
    return { daylightSavingTime, timeZone };
}
