import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.dst_offset.xml
export interface DstOffset {
    /**
     * <p>Format: `uint8`</p>
     * <p>Minimum: 0</p>
     * <p>Maximum: 8</p>
     * | Key | Description                        |
     * | --- | ---------------------------------- |
     * | 0   | Standard Time                      |
     * | 2   | Half An Hour Daylight Time (+0.5h) |
     * | 4   | Daylight Time (+1h)                |
     * | 8   | Double Daylight Time (+2h)         |
     *
     * <p>Reserved: 0 to -1</p>
     */
    dstOffset: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.dst_offset.xml | Dst Offset} */
export class DstOffsetImpl implements DstOffset {
    public static readonly UUID_PREFIX = 0x2a0d;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.dst_offset";
    public static readonly NAME = "DST Offset";

    /** Parse from a DataView into {@link DstOffset}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): DstOffsetImpl {
        return new DstOffsetImpl(dstOffsetFromDataView(dataView, indexStart));
    }

    public readonly dstOffset: number;

    public constructor(dstOffset: DstOffset) {
        this.dstOffset = dstOffset.dstOffset;
    }
}

/** Parse from a DataView into {@link DstOffset}. */
export function dstOffsetFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): DstOffset {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description                        |
     * | ----- | ---------------------------------- |
     * | 0     | Standard Time                      |
     * | 2     | Half An Hour Daylight Time (+0.5h) |
     * | 4     | Daylight Time (+1h)                |
     * | 8     | Double Daylight Time (+2h)         |
     */
    const dstOffset = $dvr.uint8();
    return { dstOffset };
}
