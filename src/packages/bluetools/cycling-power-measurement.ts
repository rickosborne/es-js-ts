import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.cycling_power_measurement.xml
/** <p>The Cycling Power Measurement characteristic is a variable length structure containing a Flags field, an Instantaneous Power field and, based on the contents of the Flags field, may contain one or more additional fields as shown in the table below.</p> */
export interface CyclingPowerMeasurement {
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.energy.joule`</p>
     * <p>Unit is in kilojoules with a resolution of 1.</p>
     */
    accumulatedEnergy?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    accumulatedEnergyPresent: number;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.moment_of_force.newton_metre`</p>
     * <p>Unit is in newton metres with a resolution of 1/32.</p>
     */
    accumulatedTorque?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    accumulatedTorquePresent: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | Wheel Based |
     * | 1     | Crank Based |
     */
    accumulatedTorqueSource: number;
    /**
     * <p>When observed with the front wheel to the right of the pedals, a value of 0 degrees represents the angle when the crank is in the 12 o'clock position and a value of 90 degrees represents the angle, measured clockwise, when the crank points towards the front wheel in a 3 o'clock position. The left crank sensor (if fitted) detects the 0? when the crank it is attached to is in the 12 o'clock position and the right sensor (if fitted) detects the 0? when the crank it is attached to is in its 12 o'clock position; thus, there is a constant 180? difference between the right crank and the left crank position signals.</p>
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.plane_angle.degree`</p>
     * <p>Unit is in degrees with a resolution of 1.</p>
     */
    bottomDeadSpotAngle?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    bottomDeadSpotAnglePresent: number;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     */
    crankRevolutionDataCumulativeCrankRevolutions?: number | undefined;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.time.second`</p>
     */
    crankRevolutionDataLastCrankEventTime?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    crankRevolutionDataPresent: number;
    /**
     * <p>When observed with the front wheel to the right of the pedals, a value of 0 degrees represents the angle when the crank is in the 12 o'clock position and a value of 90 degrees represents the angle, measured clockwise, when the crank points towards the front wheel in a 3 o'clock position. The left crank sensor (if fitted) detects the 0? when the crank it is attached to is in the 12 o'clock position and the right sensor (if fitted) detects the 0? when the crank it is attached to is in its 12 o'clock position; thus, there is a constant 180? difference between the right crank and the left crank position signals.</p>
     * <p>Format: `uint12`</p>
     * <p>Unit: `org.bluetooth.unit.plane_angle.degree`</p>
     */
    extremeAnglesMaximumAngle?: number | undefined;
    /**
     * <p>When observed with the front wheel to the right of the pedals, a value of 0 degrees represents the angle when the crank is in the 12 o'clock position and a value of 90 degrees represents the angle, measured clockwise, when the crank points towards the front wheel in a 3 o'clock position. The left crank sensor (if fitted) detects the 0? when the crank it is attached to is in the 12 o'clock position and the right sensor (if fitted) detects the 0? when the crank it is attached to is in its 12 o'clock position; thus, there is a constant 180? difference between the right crank and the left crank position signals.</p>
     * <p>Format: `uint12`</p>
     * <p>Unit: `org.bluetooth.unit.plane_angle.degree`</p>
     */
    extremeAnglesMinimumAngle?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    extremeAnglesPresent: number;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.force.newton`</p>
     */
    extremeForceMagnitudesMaximumForceMagnitude?: number | undefined;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.force.newton`</p>
     */
    extremeForceMagnitudesMinimumForceMagnitude?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    extremeForceMagnitudesPresent: number;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.moment_of_force.newton_metre`</p>
     */
    extremeTorqueMagnitudesMaximumTorqueMagnitude?: number | undefined;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.moment_of_force.newton_metre`</p>
     */
    extremeTorqueMagnitudesMinimumTorqueMagnitude?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    extremeTorqueMagnitudesPresent: number;
    /**
     * <p>Format: `16bit`</p>
     *
     * Bit field:
     *
     * | index | size | name                              |
     * | ----- | ---- | --------------------------------- |
     * | 0     | 1    | Pedal Power Balance Present       |
     * | 1     | 1    | Pedal Power Balance Reference     |
     * | 2     | 1    | Accumulated Torque Present        |
     * | 3     | 1    | Accumulated Torque Source         |
     * | 4     | 1    | Wheel Revolution Data Present     |
     * | 5     | 1    | Crank Revolution Data Present     |
     * | 6     | 1    | Extreme Force Magnitudes Present  |
     * | 7     | 1    | Extreme Torque Magnitudes Present |
     * | 8     | 1    | Extreme Angles Present            |
     * | 9     | 1    | Top Dead Spot Angle Present       |
     * | 10    | 1    | Bottom Dead Spot Angle Present    |
     * | 11    | 1    | Accumulated Energy Present        |
     * | 12    | 1    | Offset Compensation Indicator     |
     * | 13    | 3    | Reserved for future use           |
     *
     */
    flags: number;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.power.watt`</p>
     * <p>Unit is in watts with a resolution of 1.</p>
     */
    instantaneousPower: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    offsetCompensationIndicator: number;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.percentage`</p>
     * <p>Unit is in percentage with a resolution of 1/2.</p>
     */
    pedalPowerBalance?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    pedalPowerBalancePresent: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | Unknown     |
     * | 1     | Left        |
     */
    pedalPowerBalanceReference: number;
    /**
     * <p>When observed with the front wheel to the right of the pedals, a value of 0 degrees represents the angle when the crank is in the 12 o'clock position and a value of 90 degrees represents the angle, measured clockwise, when the crank points towards the front wheel in a 3 o'clock position. The left crank sensor (if fitted) detects the 0? when the crank it is attached to is in the 12 o'clock position and the right sensor (if fitted) detects the 0? when the crank it is attached to is in its 12 o'clock position; thus, there is a constant 180? difference between the right crank and the left crank position signals.</p>
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.plane_angle.degree`</p>
     * <p>Unit is in degrees with a resolution of 1.</p>
     */
    topDeadSpotAngle?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    topDeadSpotAnglePresent: number;
    /**
     * <p>Format: `uint32`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     */
    wheelRevolutionDataCumulativeWheelRevolutions?: number | undefined;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.time.second`</p>
     */
    wheelRevolutionDataLastWheelEventTime?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    wheelRevolutionDataPresent: number;
}

/**
 * The fields in the above table, reading from top to bottom, are shown in the order of LSO to MSO, where LSO = Least Significant Octet and MSO = Most Significant Octet. The Least Significant Octet represents the eight bits numbered 0 to 7.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.cycling_power_measurement.xml | Cycling Power Measurement}
 */
export class CyclingPowerMeasurementImpl implements CyclingPowerMeasurement {
    public static readonly UUID_PREFIX = 0x2a63;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.cycling_power_measurement";
    public static readonly NAME = "Cycling Power Measurement";

    /** Parse from a DataView into {@link CyclingPowerMeasurement}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): CyclingPowerMeasurementImpl {
        return new CyclingPowerMeasurementImpl(cyclingPowerMeasurementFromDataView(dataView, indexStart));
    }

    public readonly accumulatedEnergy?: number | undefined;
    public readonly accumulatedEnergyPresent: number;
    public readonly accumulatedTorque?: number | undefined;
    public readonly accumulatedTorquePresent: number;
    public readonly accumulatedTorqueSource: number;
    public readonly bottomDeadSpotAngle?: number | undefined;
    public readonly bottomDeadSpotAnglePresent: number;
    public readonly crankRevolutionDataCumulativeCrankRevolutions?: number | undefined;
    public readonly crankRevolutionDataLastCrankEventTime?: number | undefined;
    public readonly crankRevolutionDataPresent: number;
    public readonly extremeAnglesMaximumAngle?: number | undefined;
    public readonly extremeAnglesMinimumAngle?: number | undefined;
    public readonly extremeAnglesPresent: number;
    public readonly extremeForceMagnitudesMaximumForceMagnitude?: number | undefined;
    public readonly extremeForceMagnitudesMinimumForceMagnitude?: number | undefined;
    public readonly extremeForceMagnitudesPresent: number;
    public readonly extremeTorqueMagnitudesMaximumTorqueMagnitude?: number | undefined;
    public readonly extremeTorqueMagnitudesMinimumTorqueMagnitude?: number | undefined;
    public readonly extremeTorqueMagnitudesPresent: number;
    public readonly flags: number;
    public readonly instantaneousPower: number;
    public readonly offsetCompensationIndicator: number;
    public readonly pedalPowerBalance?: number | undefined;
    public readonly pedalPowerBalancePresent: number;
    public readonly pedalPowerBalanceReference: number;
    public readonly topDeadSpotAngle?: number | undefined;
    public readonly topDeadSpotAnglePresent: number;
    public readonly wheelRevolutionDataCumulativeWheelRevolutions?: number | undefined;
    public readonly wheelRevolutionDataLastWheelEventTime?: number | undefined;
    public readonly wheelRevolutionDataPresent: number;

    public constructor(cyclingPowerMeasurement: CyclingPowerMeasurement) {
        this.accumulatedEnergy = cyclingPowerMeasurement.accumulatedEnergy;
        this.accumulatedEnergyPresent = cyclingPowerMeasurement.accumulatedEnergyPresent;
        this.accumulatedTorque = cyclingPowerMeasurement.accumulatedTorque;
        this.accumulatedTorquePresent = cyclingPowerMeasurement.accumulatedTorquePresent;
        this.accumulatedTorqueSource = cyclingPowerMeasurement.accumulatedTorqueSource;
        this.bottomDeadSpotAngle = cyclingPowerMeasurement.bottomDeadSpotAngle;
        this.bottomDeadSpotAnglePresent = cyclingPowerMeasurement.bottomDeadSpotAnglePresent;
        this.crankRevolutionDataCumulativeCrankRevolutions = cyclingPowerMeasurement.crankRevolutionDataCumulativeCrankRevolutions;
        this.crankRevolutionDataLastCrankEventTime = cyclingPowerMeasurement.crankRevolutionDataLastCrankEventTime;
        this.crankRevolutionDataPresent = cyclingPowerMeasurement.crankRevolutionDataPresent;
        this.extremeAnglesMaximumAngle = cyclingPowerMeasurement.extremeAnglesMaximumAngle;
        this.extremeAnglesMinimumAngle = cyclingPowerMeasurement.extremeAnglesMinimumAngle;
        this.extremeAnglesPresent = cyclingPowerMeasurement.extremeAnglesPresent;
        this.extremeForceMagnitudesMaximumForceMagnitude = cyclingPowerMeasurement.extremeForceMagnitudesMaximumForceMagnitude;
        this.extremeForceMagnitudesMinimumForceMagnitude = cyclingPowerMeasurement.extremeForceMagnitudesMinimumForceMagnitude;
        this.extremeForceMagnitudesPresent = cyclingPowerMeasurement.extremeForceMagnitudesPresent;
        this.extremeTorqueMagnitudesMaximumTorqueMagnitude = cyclingPowerMeasurement.extremeTorqueMagnitudesMaximumTorqueMagnitude;
        this.extremeTorqueMagnitudesMinimumTorqueMagnitude = cyclingPowerMeasurement.extremeTorqueMagnitudesMinimumTorqueMagnitude;
        this.extremeTorqueMagnitudesPresent = cyclingPowerMeasurement.extremeTorqueMagnitudesPresent;
        this.flags = cyclingPowerMeasurement.flags;
        this.instantaneousPower = cyclingPowerMeasurement.instantaneousPower;
        this.offsetCompensationIndicator = cyclingPowerMeasurement.offsetCompensationIndicator;
        this.pedalPowerBalance = cyclingPowerMeasurement.pedalPowerBalance;
        this.pedalPowerBalancePresent = cyclingPowerMeasurement.pedalPowerBalancePresent;
        this.pedalPowerBalanceReference = cyclingPowerMeasurement.pedalPowerBalanceReference;
        this.topDeadSpotAngle = cyclingPowerMeasurement.topDeadSpotAngle;
        this.topDeadSpotAnglePresent = cyclingPowerMeasurement.topDeadSpotAnglePresent;
        this.wheelRevolutionDataCumulativeWheelRevolutions = cyclingPowerMeasurement.wheelRevolutionDataCumulativeWheelRevolutions;
        this.wheelRevolutionDataLastWheelEventTime = cyclingPowerMeasurement.wheelRevolutionDataLastWheelEventTime;
        this.wheelRevolutionDataPresent = cyclingPowerMeasurement.wheelRevolutionDataPresent;
    }
}

/** Parse from a DataView into {@link CyclingPowerMeasurement}. */
export function cyclingPowerMeasurementFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): CyclingPowerMeasurement {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const flags = $dvr.uint16();
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const pedalPowerBalancePresent = flags & 0b0000_0000_0000_0001;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | Unknown     |
     * | 1     | Left        |
     */
    const pedalPowerBalanceReference = (flags & 0b0000_0000_0000_0010) >> 1;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const accumulatedTorquePresent = (flags & 0b0000_0000_0000_0100) >> 2;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | Wheel Based |
     * | 1     | Crank Based |
     */
    const accumulatedTorqueSource = (flags & 0b0000_0000_0000_1000) >> 3;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const wheelRevolutionDataPresent = (flags & 0b0000_0000_0001_0000) >> 4;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const crankRevolutionDataPresent = (flags & 0b0000_0000_0010_0000) >> 5;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const extremeForceMagnitudesPresent = (flags & 0b0000_0000_0100_0000) >> 6;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const extremeTorqueMagnitudesPresent = (flags & 0b0000_0000_1000_0000) >> 7;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const extremeAnglesPresent = (flags & 0b0000_0001_0000_0000) >> 8;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const topDeadSpotAnglePresent = (flags & 0b0000_0010_0000_0000) >> 9;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const bottomDeadSpotAnglePresent = (flags & 0b0000_0100_0000_0000) >> 10;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const accumulatedEnergyPresent = (flags & 0b0000_1000_0000_0000) >> 11;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const offsetCompensationIndicator = (flags & 0b0001_0000_0000_0000) >> 12;
    const instantaneousPower = $dvr.int16();
    const pedalPowerBalance = $dvr.uint8();
    const accumulatedTorque = $dvr.uint16();
    let wheelRevolutionDataCumulativeWheelRevolutions: number | undefined = undefined;
    if (wheelRevolutionDataPresent) {
        wheelRevolutionDataCumulativeWheelRevolutions = $dvr.uint32();
    }

    let wheelRevolutionDataLastWheelEventTime: number | undefined = undefined;
    if (wheelRevolutionDataPresent) {
        wheelRevolutionDataLastWheelEventTime = $dvr.uint16();
    }

    let crankRevolutionDataCumulativeCrankRevolutions: number | undefined = undefined;
    if (crankRevolutionDataPresent) {
        crankRevolutionDataCumulativeCrankRevolutions = $dvr.uint16();
    }

    let crankRevolutionDataLastCrankEventTime: number | undefined = undefined;
    if (crankRevolutionDataPresent) {
        crankRevolutionDataLastCrankEventTime = $dvr.uint16();
    }

    let extremeForceMagnitudesMaximumForceMagnitude: number | undefined = undefined;
    if (extremeForceMagnitudesPresent) {
        extremeForceMagnitudesMaximumForceMagnitude = $dvr.int16();
    }

    let extremeForceMagnitudesMinimumForceMagnitude: number | undefined = undefined;
    if (extremeForceMagnitudesPresent) {
        extremeForceMagnitudesMinimumForceMagnitude = $dvr.int16();
    }

    let extremeTorqueMagnitudesMaximumTorqueMagnitude: number | undefined = undefined;
    if (extremeTorqueMagnitudesPresent) {
        extremeTorqueMagnitudesMaximumTorqueMagnitude = $dvr.int16();
    }

    let extremeTorqueMagnitudesMinimumTorqueMagnitude: number | undefined = undefined;
    if (extremeTorqueMagnitudesPresent) {
        extremeTorqueMagnitudesMinimumTorqueMagnitude = $dvr.int16();
    }

    let extremeAnglesMaximumAngle: number | undefined = undefined;
    if (extremeAnglesPresent) {
        extremeAnglesMaximumAngle = $dvr.uint12();
    }

    let extremeAnglesMinimumAngle: number | undefined = undefined;
    if (extremeAnglesPresent) {
        extremeAnglesMinimumAngle = $dvr.uint12();
    }

    const topDeadSpotAngle = $dvr.uint16();
    const bottomDeadSpotAngle = $dvr.uint16();
    const accumulatedEnergy = $dvr.uint16();
    return { accumulatedEnergy, accumulatedEnergyPresent, accumulatedTorque, accumulatedTorquePresent, accumulatedTorqueSource, bottomDeadSpotAngle, bottomDeadSpotAnglePresent, crankRevolutionDataCumulativeCrankRevolutions, crankRevolutionDataLastCrankEventTime, crankRevolutionDataPresent, extremeAnglesMaximumAngle, extremeAnglesMinimumAngle, extremeAnglesPresent, extremeForceMagnitudesMaximumForceMagnitude, extremeForceMagnitudesMinimumForceMagnitude, extremeForceMagnitudesPresent, extremeTorqueMagnitudesMaximumTorqueMagnitude, extremeTorqueMagnitudesMinimumTorqueMagnitude, extremeTorqueMagnitudesPresent, flags, instantaneousPower, offsetCompensationIndicator, pedalPowerBalance, pedalPowerBalancePresent, pedalPowerBalanceReference, topDeadSpotAngle, topDeadSpotAnglePresent, wheelRevolutionDataCumulativeWheelRevolutions, wheelRevolutionDataLastWheelEventTime, wheelRevolutionDataPresent };
}
