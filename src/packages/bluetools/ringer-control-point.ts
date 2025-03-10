import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.ringer_control_point.xml
/**
 * <p>Value 1, meaning ?Silent Mode"</p>
 * <p>Value 2, meaning ?Mute Once?</p>
 * <p>Value 3, meaning ?Cancel Silent Mode?</p>
 * <p>The value 0x01 shall be interpreted as ?Silent Mode?</p>
 */
export interface RingerControlPoint {
    /**
     * <p>Format: `uint8`</p>
     * <p>Minimum: 1</p>
     * <p>Maximum: 3</p>
     * | Key | Description        |
     * | --- | ------------------ |
     * | 1   | Silent Mode        |
     * | 2   | Mute Once          |
     * | 3   | Cancel Silent Mode |
     *
     * <p>Reserved for future use: 0 to -1</p>
     */
    ringerControlPoint: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.ringer_control_point.xml | Ringer Control Point} */
export class RingerControlPointImpl implements RingerControlPoint {
    public static readonly UUID_PREFIX = 0x2a40;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.ringer_control_point";
    public static readonly NAME = "Ringer Control point";

    /** Parse from a DataView into {@link RingerControlPoint}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): RingerControlPointImpl {
        return new RingerControlPointImpl(ringerControlPointFromDataView(dataView, indexStart));
    }

    public readonly ringerControlPoint: number;

    public constructor(ringerControlPoint: RingerControlPoint) {
        this.ringerControlPoint = ringerControlPoint.ringerControlPoint;
    }
}

/** Parse from a DataView into {@link RingerControlPoint}. */
export function ringerControlPointFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): RingerControlPoint {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description        |
     * | ----- | ------------------ |
     * | 1     | Silent Mode        |
     * | 2     | Mute Once          |
     * | 3     | Cancel Silent Mode |
     */
    const ringerControlPoint = $dvr.uint8();
    return { ringerControlPoint };
}
