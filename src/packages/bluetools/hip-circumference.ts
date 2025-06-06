import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.hip_circumference.xml
/** <p>Used with the Waist Circumference value to calculate the Waist to Hip Ratio (WHR)</p> */
export interface HipCircumference {
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.length.meter`</p>
     * <p>Unit is in meters with a resoluton of 0.01</p>
     */
    hipCircumference: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.hip_circumference.xml | Hip Circumference} */
export class HipCircumferenceImpl implements HipCircumference {
    public static readonly UUID_PREFIX = 0x2a8f;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.hip_circumference";
    public static readonly NAME = "Hip Circumference";

    /** Parse from a DataView into {@link HipCircumference}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): HipCircumferenceImpl {
        return new HipCircumferenceImpl(hipCircumferenceFromDataView(dataView, indexStart));
    }

    public readonly hipCircumference: number;

    public constructor(hipCircumference: HipCircumference) {
        this.hipCircumference = hipCircumference.hipCircumference;
    }
}

/** Parse from a DataView into {@link HipCircumference}. */
export function hipCircumferenceFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): HipCircumference {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const hipCircumference = $dvr.uint16();
    return { hipCircumference };
}
