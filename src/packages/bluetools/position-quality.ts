import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.position_quality.xml
/** <p>The Position Quality characteristic is a variable length structure containing a Flags field and at least one of the optional data fields listed below</p> */
export interface PositionQuality {
    /**
     * <p>Format: `uint32`</p>
     * <p>Unit: `org.bluetooth.unit.length.meter`</p>
     * <p>Unit is in meters with a resolution of 1/100</p>
     */
    ehpe?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    ehpePresent: number;
    /**
     * <p>Format: `uint32`</p>
     * <p>Unit: `org.bluetooth.unit.length.meter`</p>
     * <p>Unit is in meters with a resolution of 1/100</p>
     */
    evpe?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    evpePresent: number;
    /**
     * <p>Format: `16bit`</p>
     *
     * Bit field:
     *
     * | index | size | name                                  |
     * | ----- | ---- | ------------------------------------- |
     * | 0     | 1    | Number of Beacons in Solution Present |
     * | 1     | 1    | Number of Beacons in View Present     |
     * | 2     | 1    | Time to First Fix Present             |
     * | 3     | 1    | EHPE Present                          |
     * | 4     | 1    | EVPE Present                          |
     * | 5     | 1    | HDOP Present                          |
     * | 6     | 1    | VDOP Present                          |
     * | 7     | 2    | Position Status                       |
     * | 9     | 7    | Reserved for future use               |
     *
     */
    flags: number;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     * <p>Unitless with a resolution of 2/10</p>
     */
    hdop?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    hdopPresent: number;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     * <p>Unitless with a resolution of 1</p>
     */
    numberOfBeaconsInSolution?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    numberOfBeaconsInSolutionPresent: number;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     * <p>Unitless with a resolution of 1</p>
     */
    numberOfBeaconsInView?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    numberOfBeaconsInViewPresent: number;
    /**
     * | value | description         |
     * | ----- | ------------------- |
     * | 0     | No Position         |
     * | 1     | Position Ok         |
     * | 2     | Estimated Position  |
     * | 3     | Last Known Position |
     */
    positionStatus: number;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.time.second`</p>
     * <p>Unit is in seconds with a resolution of 1/10</p>
     */
    timeToFirstFix?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    timeToFirstFixPresent: number;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     * <p>Unitless with a resolution of 2/10</p>
     */
    vdop?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    vdopPresent: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.position_quality.xml | Position Quality} */
export class PositionQualityImpl implements PositionQuality {
    public static readonly UUID_PREFIX = 0x2a69;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.position_quality";
    public static readonly NAME = "Position Quality";

    /** Parse from a DataView into {@link PositionQuality}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): PositionQualityImpl {
        return new PositionQualityImpl(positionQualityFromDataView(dataView, indexStart));
    }

    public readonly ehpe?: number | undefined;
    public readonly ehpePresent: number;
    public readonly evpe?: number | undefined;
    public readonly evpePresent: number;
    public readonly flags: number;
    public readonly hdop?: number | undefined;
    public readonly hdopPresent: number;
    public readonly numberOfBeaconsInSolution?: number | undefined;
    public readonly numberOfBeaconsInSolutionPresent: number;
    public readonly numberOfBeaconsInView?: number | undefined;
    public readonly numberOfBeaconsInViewPresent: number;
    public readonly positionStatus: number;
    public readonly timeToFirstFix?: number | undefined;
    public readonly timeToFirstFixPresent: number;
    public readonly vdop?: number | undefined;
    public readonly vdopPresent: number;

    public constructor(positionQuality: PositionQuality) {
        this.ehpe = positionQuality.ehpe;
        this.ehpePresent = positionQuality.ehpePresent;
        this.evpe = positionQuality.evpe;
        this.evpePresent = positionQuality.evpePresent;
        this.flags = positionQuality.flags;
        this.hdop = positionQuality.hdop;
        this.hdopPresent = positionQuality.hdopPresent;
        this.numberOfBeaconsInSolution = positionQuality.numberOfBeaconsInSolution;
        this.numberOfBeaconsInSolutionPresent = positionQuality.numberOfBeaconsInSolutionPresent;
        this.numberOfBeaconsInView = positionQuality.numberOfBeaconsInView;
        this.numberOfBeaconsInViewPresent = positionQuality.numberOfBeaconsInViewPresent;
        this.positionStatus = positionQuality.positionStatus;
        this.timeToFirstFix = positionQuality.timeToFirstFix;
        this.timeToFirstFixPresent = positionQuality.timeToFirstFixPresent;
        this.vdop = positionQuality.vdop;
        this.vdopPresent = positionQuality.vdopPresent;
    }
}

/** Parse from a DataView into {@link PositionQuality}. */
export function positionQualityFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): PositionQuality {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const flags = $dvr.uint16();
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const numberOfBeaconsInSolutionPresent = flags & 0b0000_0000_0000_0001;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const numberOfBeaconsInViewPresent = (flags & 0b0000_0000_0000_0010) >> 1;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const timeToFirstFixPresent = (flags & 0b0000_0000_0000_0100) >> 2;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const ehpePresent = (flags & 0b0000_0000_0000_1000) >> 3;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const evpePresent = (flags & 0b0000_0000_0001_0000) >> 4;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const hdopPresent = (flags & 0b0000_0000_0010_0000) >> 5;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const vdopPresent = (flags & 0b0000_0000_0100_0000) >> 6;
    /**
     * | value | description         |
     * | ----- | ------------------- |
     * | 0     | No Position         |
     * | 1     | Position Ok         |
     * | 2     | Estimated Position  |
     * | 3     | Last Known Position |
     */
    const positionStatus = (flags & 0b0000_0001_1000_0000) >> 7;
    const numberOfBeaconsInSolution = $dvr.uint8();
    const numberOfBeaconsInView = $dvr.uint8();
    const timeToFirstFix = $dvr.uint16();
    const ehpe = $dvr.uint32();
    const evpe = $dvr.uint32();
    const hdop = $dvr.uint8();
    const vdop = $dvr.uint8();
    return { ehpe, ehpePresent, evpe, evpePresent, flags, hdop, hdopPresent, numberOfBeaconsInSolution, numberOfBeaconsInSolutionPresent, numberOfBeaconsInView, numberOfBeaconsInViewPresent, positionStatus, timeToFirstFix, timeToFirstFixPresent, vdop, vdopPresent };
}
