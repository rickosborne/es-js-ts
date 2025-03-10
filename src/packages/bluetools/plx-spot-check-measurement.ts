import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type DateTime, DateTimeImpl } from "./date-time.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.plx_spot_check_measurement.xml
/** <p>The PLX Spot-check Measurement characteristic, if supported, is used to send Spot-check measurements of SpO2 (Percent oxygen saturation of hemoglobin) and PR (pulse rate). This characteristic is a variable length structure containing the Flags field, the SpO2PR-Spot-Check field, and depending on the contents of the Flags field, the Timestamp field, the Measurement Status field, the Device and Sensor Status field, and/or the Pulse Amplitude Index field.</p> */
export interface PlxSpotCheckMeasurement {
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    calibrationOngoing: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    dataForDemonstration: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    dataForTesting: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    dataFromMeasurementStorage: number;
    /**
     * <p>Format: `24bit`</p>
     *
     * Bit field:
     *
     * | index | size | name                                    |
     * | ----- | ---- | --------------------------------------- |
     * | 0     | 1    | Extended Display Update Ongoing         |
     * | 1     | 1    | Equipment Malfunction Detected          |
     * | 2     | 1    | Signal Processing Irregularity Detected |
     * | 3     | 1    | Inadequite Signal Detected              |
     * | 4     | 1    | Poor Signal Detected                    |
     * | 5     | 1    | Low Perfusion Detected                  |
     * | 6     | 1    | Erratic Signal Detected                 |
     * | 7     | 1    | Nonpulsatile Signal Detected            |
     * | 8     | 1    | Questionable Pulse Detected             |
     * | 9     | 1    | Signal Analysis Ongoing                 |
     * | 10    | 1    | Sensor Interface Detected               |
     * | 11    | 1    | Sensor Unconnected to User              |
     * | 12    | 1    | Unknown Sensor Connected                |
     * | 13    | 1    | Sensor Displaced                        |
     * | 14    | 1    | Sensor Malfunctioning                   |
     * | 15    | 1    | Sensor Disconnected                     |
     * | 16    | 8    | Reserved for future use                 |
     *
     */
    deviceAndSensorStatus: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    deviceClockIsNotSet: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    earlyEstimatedData: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    equipmentMalfunctionDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    erraticSignalDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    extendedDisplayUpdateOngoing: number;
    /**
     * <p>Format: `8bit`</p>
     * <p>These flags define which data fields are present in the Characteristic value</p>
     *
     * Bit field:
     *
     * | index | size | req | name                                   |
     * | ----- | ---- | --- | -------------------------------------- |
     * | 0     | 1    | C1  | Timestamp field is present             |
     * | 1     | 1    | C2  | Measurement Status Field Present       |
     * | 2     | 1    | C3  | Device and Sensor Status Field Present |
     * | 3     | 1    | C4  | Pulse Amplitude Index field is present |
     * | 4     | 1    |     | Device Clock is Not Set                |
     * | 5     | 3    |     | Reserved for future use                |
     *
     */
    flags: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    fullyQualifiedData: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    inadequiteSignalDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    invalidMeasurementDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    lowPerfusionDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    measurementOngoing: number;
    /**
     * <p>Format: `16bit`</p>
     *
     * Bit field:
     *
     * | index | size | name                              |
     * | ----- | ---- | --------------------------------- |
     * | 5     | 1    | Measurement Ongoing               |
     * | 6     | 1    | Early Estimated Data              |
     * | 7     | 1    | Validated Data                    |
     * | 8     | 1    | Fully Qualified Data              |
     * | 9     | 1    | Data from Measurement Storage     |
     * | 10    | 1    | Data for Demonstration            |
     * | 11    | 1    | Data for Testing                  |
     * | 12    | 1    | Calibration Ongoing               |
     * | 13    | 1    | Measurement Unavailable           |
     * | 14    | 1    | Questionable Measurement Detected |
     * | 15    | 1    | Invalid Measurement Detected      |
     * | 0     | 5    | Reserved for future use           |
     *
     */
    measurementStatus: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    measurementUnavailable: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    nonpulsatileSignalDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    poorSignalDetected: number;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.percentage`</p>
     * <p>Unit is percentage with a resolution of 1</p>
     */
    pulseAmplitudeIndex?: number | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    questionableMeasurementDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    questionablePulseDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    sensorDisconnected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    sensorDisplaced: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    sensorInterfaceDetected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    sensorMalfunctioning: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    sensorUnconnectedToUser: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    signalAnalysisOngoing: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    signalProcessingIrregularityDetected: number;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.period.beats_per_minute`</p>
     * <p>Unit is beats per minute with a resolution of 1</p>
     */
    spo2prSpotCheckPR: number;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.percentage`</p>
     * <p>Unit is percentage with a resolution of 1</p>
     */
    spo2prSpotCheckSpO2: number;
    /** <p>Unit is smallest unit in seconds with a resolution of 1</p> */
    timestamp?: DateTime | undefined;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    unknownSensorConnected: number;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    validatedData: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.plx_spot_check_measurement.xml | Plx Spot Check Measurement} */
export class PlxSpotCheckMeasurementImpl implements PlxSpotCheckMeasurement {
    public static readonly UUID_PREFIX = 0x2a5e;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.plx_spot_check_measurement";
    public static readonly NAME = "PLX Spot-Check Measurement";

    /** Parse from a DataView into {@link PlxSpotCheckMeasurement}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): PlxSpotCheckMeasurementImpl {
        return new PlxSpotCheckMeasurementImpl(plxSpotCheckMeasurementFromDataView(dataView, indexStart));
    }

    public readonly calibrationOngoing: number;
    public readonly dataForDemonstration: number;
    public readonly dataForTesting: number;
    public readonly dataFromMeasurementStorage: number;
    public readonly deviceAndSensorStatus: number;
    public readonly deviceClockIsNotSet: number;
    public readonly earlyEstimatedData: number;
    public readonly equipmentMalfunctionDetected: number;
    public readonly erraticSignalDetected: number;
    public readonly extendedDisplayUpdateOngoing: number;
    public readonly flags: number;
    public readonly fullyQualifiedData: number;
    public readonly inadequiteSignalDetected: number;
    public readonly invalidMeasurementDetected: number;
    public readonly lowPerfusionDetected: number;
    public readonly measurementOngoing: number;
    public readonly measurementStatus: number;
    public readonly measurementUnavailable: number;
    public readonly nonpulsatileSignalDetected: number;
    public readonly poorSignalDetected: number;
    public readonly pulseAmplitudeIndex?: number | undefined;
    public readonly questionableMeasurementDetected: number;
    public readonly questionablePulseDetected: number;
    public readonly sensorDisconnected: number;
    public readonly sensorDisplaced: number;
    public readonly sensorInterfaceDetected: number;
    public readonly sensorMalfunctioning: number;
    public readonly sensorUnconnectedToUser: number;
    public readonly signalAnalysisOngoing: number;
    public readonly signalProcessingIrregularityDetected: number;
    public readonly spo2prSpotCheckPR: number;
    public readonly spo2prSpotCheckSpO2: number;
    public readonly timestamp?: DateTime | undefined;
    public readonly unknownSensorConnected: number;
    public readonly validatedData: number;

    public constructor(plxSpotCheckMeasurement: PlxSpotCheckMeasurement) {
        this.calibrationOngoing = plxSpotCheckMeasurement.calibrationOngoing;
        this.dataForDemonstration = plxSpotCheckMeasurement.dataForDemonstration;
        this.dataForTesting = plxSpotCheckMeasurement.dataForTesting;
        this.dataFromMeasurementStorage = plxSpotCheckMeasurement.dataFromMeasurementStorage;
        this.deviceAndSensorStatus = plxSpotCheckMeasurement.deviceAndSensorStatus;
        this.deviceClockIsNotSet = plxSpotCheckMeasurement.deviceClockIsNotSet;
        this.earlyEstimatedData = plxSpotCheckMeasurement.earlyEstimatedData;
        this.equipmentMalfunctionDetected = plxSpotCheckMeasurement.equipmentMalfunctionDetected;
        this.erraticSignalDetected = plxSpotCheckMeasurement.erraticSignalDetected;
        this.extendedDisplayUpdateOngoing = plxSpotCheckMeasurement.extendedDisplayUpdateOngoing;
        this.flags = plxSpotCheckMeasurement.flags;
        this.fullyQualifiedData = plxSpotCheckMeasurement.fullyQualifiedData;
        this.inadequiteSignalDetected = plxSpotCheckMeasurement.inadequiteSignalDetected;
        this.invalidMeasurementDetected = plxSpotCheckMeasurement.invalidMeasurementDetected;
        this.lowPerfusionDetected = plxSpotCheckMeasurement.lowPerfusionDetected;
        this.measurementOngoing = plxSpotCheckMeasurement.measurementOngoing;
        this.measurementStatus = plxSpotCheckMeasurement.measurementStatus;
        this.measurementUnavailable = plxSpotCheckMeasurement.measurementUnavailable;
        this.nonpulsatileSignalDetected = plxSpotCheckMeasurement.nonpulsatileSignalDetected;
        this.poorSignalDetected = plxSpotCheckMeasurement.poorSignalDetected;
        this.pulseAmplitudeIndex = plxSpotCheckMeasurement.pulseAmplitudeIndex;
        this.questionableMeasurementDetected = plxSpotCheckMeasurement.questionableMeasurementDetected;
        this.questionablePulseDetected = plxSpotCheckMeasurement.questionablePulseDetected;
        this.sensorDisconnected = plxSpotCheckMeasurement.sensorDisconnected;
        this.sensorDisplaced = plxSpotCheckMeasurement.sensorDisplaced;
        this.sensorInterfaceDetected = plxSpotCheckMeasurement.sensorInterfaceDetected;
        this.sensorMalfunctioning = plxSpotCheckMeasurement.sensorMalfunctioning;
        this.sensorUnconnectedToUser = plxSpotCheckMeasurement.sensorUnconnectedToUser;
        this.signalAnalysisOngoing = plxSpotCheckMeasurement.signalAnalysisOngoing;
        this.signalProcessingIrregularityDetected = plxSpotCheckMeasurement.signalProcessingIrregularityDetected;
        this.spo2prSpotCheckPR = plxSpotCheckMeasurement.spo2prSpotCheckPR;
        this.spo2prSpotCheckSpO2 = plxSpotCheckMeasurement.spo2prSpotCheckSpO2;
        this.timestamp = plxSpotCheckMeasurement.timestamp;
        this.unknownSensorConnected = plxSpotCheckMeasurement.unknownSensorConnected;
        this.validatedData = plxSpotCheckMeasurement.validatedData;
    }
}

/** Parse from a DataView into {@link PlxSpotCheckMeasurement}. */
export function plxSpotCheckMeasurementFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): PlxSpotCheckMeasurement {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const flags = $dvr.uint8();
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C1  | True        |
     * <p>Requirements: C1</p>
     */
    const timestampFieldIsPresent = !!(flags & 0b0000_0001);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C2  | True        |
     * <p>Requirements: C2</p>
     */
    const measurementStatusFieldPresent = !!((flags & 0b0000_0010) >> 1);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C3  | True        |
     * <p>Requirements: C3</p>
     */
    const deviceAndSensorStatusFieldPresent = !!((flags & 0b0000_0100) >> 2);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C4  | True        |
     * <p>Requirements: C4</p>
     */
    const pulseAmplitudeIndexFieldIsPresent = !!((flags & 0b0000_1000) >> 3);
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const deviceClockIsNotSet = (flags & 0b0001_0000) >> 4;
    const spo2prSpotCheckSpO2 = $dvr.float16();
    const spo2prSpotCheckPR = $dvr.float16();
    let timestamp: DateTime | undefined = undefined;
    if (timestampFieldIsPresent) {
        timestamp = DateTimeImpl.fromDataView($dvr);
    }

    let measurementStatus: number = 0;
    if (measurementStatusFieldPresent) {
        measurementStatus = $dvr.uint16();
    }

    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const measurementOngoing = (measurementStatus & 0b0000_0000_0010_0000) >> 5;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const earlyEstimatedData = (measurementStatus & 0b0000_0000_0100_0000) >> 6;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const validatedData = (measurementStatus & 0b0000_0000_1000_0000) >> 7;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const fullyQualifiedData = (measurementStatus & 0b0000_0001_0000_0000) >> 8;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const dataFromMeasurementStorage = (measurementStatus & 0b0000_0010_0000_0000) >> 9;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const dataForDemonstration = (measurementStatus & 0b0000_0100_0000_0000) >> 10;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const dataForTesting = (measurementStatus & 0b0000_1000_0000_0000) >> 11;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const calibrationOngoing = (measurementStatus & 0b0001_0000_0000_0000) >> 12;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const measurementUnavailable = (measurementStatus & 0b0010_0000_0000_0000) >> 13;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const questionableMeasurementDetected = (measurementStatus & 0b0100_0000_0000_0000) >> 14;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const invalidMeasurementDetected = (measurementStatus & 0b1000_0000_0000_0000) >> 15;
    let deviceAndSensorStatus: number = 0;
    if (deviceAndSensorStatusFieldPresent) {
        deviceAndSensorStatus = $dvr.uint24();
    }

    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const extendedDisplayUpdateOngoing = deviceAndSensorStatus & 0b0000_0000_0000_0000_0000_0001;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const equipmentMalfunctionDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0000_0010) >> 1;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const signalProcessingIrregularityDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0000_0100) >> 2;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const inadequiteSignalDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0000_1000) >> 3;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const poorSignalDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0001_0000) >> 4;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const lowPerfusionDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0010_0000) >> 5;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const erraticSignalDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_0100_0000) >> 6;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const nonpulsatileSignalDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0000_1000_0000) >> 7;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const questionablePulseDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0001_0000_0000) >> 8;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const signalAnalysisOngoing = (deviceAndSensorStatus & 0b0000_0000_0000_0010_0000_0000) >> 9;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const sensorInterfaceDetected = (deviceAndSensorStatus & 0b0000_0000_0000_0100_0000_0000) >> 10;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const sensorUnconnectedToUser = (deviceAndSensorStatus & 0b0000_0000_0000_1000_0000_0000) >> 11;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const unknownSensorConnected = (deviceAndSensorStatus & 0b0000_0000_0001_0000_0000_0000) >> 12;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const sensorDisplaced = (deviceAndSensorStatus & 0b0000_0000_0010_0000_0000_0000) >> 13;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const sensorMalfunctioning = (deviceAndSensorStatus & 0b0000_0000_0100_0000_0000_0000) >> 14;
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 0     | False       |
     * | 1     | True        |
     */
    const sensorDisconnected = (deviceAndSensorStatus & 0b0000_0000_1000_0000_0000_0000) >> 15;
    let pulseAmplitudeIndex: number | undefined = undefined;
    if (pulseAmplitudeIndexFieldIsPresent) {
        pulseAmplitudeIndex = $dvr.float16();
    }

    return { calibrationOngoing, dataForDemonstration, dataForTesting, dataFromMeasurementStorage, deviceAndSensorStatus, deviceClockIsNotSet, earlyEstimatedData, equipmentMalfunctionDetected, erraticSignalDetected, extendedDisplayUpdateOngoing, flags, fullyQualifiedData, inadequiteSignalDetected, invalidMeasurementDetected, lowPerfusionDetected, measurementOngoing, measurementStatus, measurementUnavailable, nonpulsatileSignalDetected, poorSignalDetected, pulseAmplitudeIndex, questionableMeasurementDetected, questionablePulseDetected, sensorDisconnected, sensorDisplaced, sensorInterfaceDetected, sensorMalfunctioning, sensorUnconnectedToUser, signalAnalysisOngoing, signalProcessingIrregularityDetected, spo2prSpotCheckPR, spo2prSpotCheckSpO2, timestamp, unknownSensorConnected, validatedData };
}
