import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.digital.xml
/** <p>The Digital characteristic is used to expose and change the state of an IO Module?s digital signals.</p> */
export interface Digital {
    /**
     * <p>Format: `2bit`</p>
     * <p>The Digital characteristic is an array of n 2-bit values in a bit field</p>
     * | Key | Description  |
     * | --- | ------------ |
     * | 0   | Inactive     |
     * | 1   | Active       |
     * | 2   | Tri-state    |
     * | 3   | Output-state |
     *
     */
    digital: number;
}

/**
 * The Octet Order in the above table is in the order of LSO to MSO, where LSO = Least Significant Octet and MSO = Most Significant Octet.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.digital.xml | Digital}
 */
export class DigitalImpl implements Digital {
    public static readonly UUID_PREFIX = 0x2a56;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.digital";
    public static readonly NAME = "Digital";

    /** Parse from a DataView into {@link Digital}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): DigitalImpl {
        return new DigitalImpl(digitalFromDataView(dataView, indexStart));
    }

    public readonly digital: number;

    public constructor(digital: Digital) {
        this.digital = digital.digital;
    }
}

/** Parse from a DataView into {@link Digital}. */
export function digitalFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Digital {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description  |
     * | ----- | ------------ |
     * | 0     | Inactive     |
     * | 1     | Active       |
     * | 2     | Tri-state    |
     * | 3     | Output-state |
     */
    const digital = $dvr.uint2();
    return { digital };
}
