import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.rsc_feature.xml
/** <p>The RSC (Running Speed and Cadence) Feature characteristic is used to describe the supported features of the Server.</p> */
export interface RscFeature {
    /**
     * <p>Format: `16bit`</p>
     *
     * Bit field:
     *
     * | index | size | name                                              |
     * | ----- | ---- | ------------------------------------------------- |
     * | 0     | 1    | Instantaneous Stride Length Measurement Supported |
     * | 1     | 1    | Total Distance Measurement Supported              |
     * | 2     | 1    | Walking or Running Status Supported               |
     * | 3     | 1    | Calibration Procedure Supported                   |
     * | 4     | 1    | Multiple Sensor Locations Supported               |
     * | 5     | 11   | Reserved for future use                           |
     *
     */
    rscFeature: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    supportsCalibration: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    supportsInstantStride: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    supportsMultipleSensors: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    supportsTotalDistance: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    supportsWalkRun: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.rsc_feature.xml | Rsc Feature} */
export class RscFeatureImpl implements RscFeature {
    public static readonly UUID_PREFIX = 0x2a54;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.rsc_feature";
    public static readonly NAME = "RSC Feature";

    /** Parse from a DataView into {@link RscFeature}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): RscFeatureImpl {
        return new RscFeatureImpl(rscFeatureFromDataView(dataView, indexStart));
    }

    public readonly rscFeature: number;
    public readonly supportsCalibration: number;
    public readonly supportsInstantStride: number;
    public readonly supportsMultipleSensors: number;
    public readonly supportsTotalDistance: number;
    public readonly supportsWalkRun: number;

    public constructor(rscFeature: RscFeature) {
        this.rscFeature = rscFeature.rscFeature;
        this.supportsCalibration = rscFeature.supportsCalibration;
        this.supportsInstantStride = rscFeature.supportsInstantStride;
        this.supportsMultipleSensors = rscFeature.supportsMultipleSensors;
        this.supportsTotalDistance = rscFeature.supportsTotalDistance;
        this.supportsWalkRun = rscFeature.supportsWalkRun;
    }
}

/** Parse from a DataView into {@link RscFeature}. */
export function rscFeatureFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): RscFeature {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const rscFeature = $dvr.uint16();
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const supportsInstantStride = rscFeature & 0b0000_0000_0000_0001;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const supportsTotalDistance = (rscFeature & 0b0000_0000_0000_0010) >> 1;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const supportsWalkRun = (rscFeature & 0b0000_0000_0000_0100) >> 2;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const supportsCalibration = (rscFeature & 0b0000_0000_0000_1000) >> 3;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const supportsMultipleSensors = (rscFeature & 0b0000_0000_0001_0000) >> 4;
    return { rscFeature, supportsCalibration, supportsInstantStride, supportsMultipleSensors, supportsTotalDistance, supportsWalkRun };
}
