import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.gender.xml
/** <p>Gender of the user. The value of the Gender characteristic are defined below: 0:male,1:female, 2:Unspecified,3-225: RFU</p> */
export interface Gender {
    /**
     * <p>Format: `uint8`</p>
     * | Key | Description |
     * | --- | ----------- |
     * | 0   | Male        |
     * | 1   | Female      |
     * | 2   | Unspecified |
     *
     * <p>Reserved for future use: 3 to 225</p>
     */
    gender: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.gender.xml | Gender} */
export class GenderImpl implements Gender {
    public static readonly UUID_PREFIX = 0x2a8c;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.gender";
    public static readonly NAME = "Gender";

    /** Parse from a DataView into {@link Gender}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): GenderImpl {
        return new GenderImpl(genderFromDataView(dataView, indexStart));
    }

    public readonly gender: number;

    public constructor(gender: Gender) {
        this.gender = gender.gender;
    }
}

/** Parse from a DataView into {@link Gender}. */
export function genderFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Gender {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | Male        |
     * | 1     | Female      |
     * | 2     | Unspecified |
     */
    const gender = $dvr.uint8();
    return { gender };
}
