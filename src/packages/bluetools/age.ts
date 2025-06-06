import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.age.xml
/** <p>Age of the User.</p> */
export interface Age {
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.time.year`</p>
     */
    age: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.age.xml | Age} */
export class AgeImpl implements Age {
    public static readonly UUID_PREFIX = 0x2a80;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.age";
    public static readonly NAME = "Age";

    /** Parse from a DataView into {@link Age}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): AgeImpl {
        return new AgeImpl(ageFromDataView(dataView, indexStart));
    }

    public readonly age: number;

    public constructor(age: Age) {
        this.age = age.age;
    }
}

/** Parse from a DataView into {@link Age}. */
export function ageFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Age {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const age = $dvr.uint8();
    return { age };
}
