import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.glucose_measurement_context.xml
/** <p>The Glucose Measurement Context characteristic is a variable length structure containing a Flags field, a Sequence Number field and, based upon the contents of the Flags field, may contain a Carbohydrate ID field, Carbohydrate field, Meal field, Tester-Health field, Exercise Duration field, Exercise Intensity field, Medication ID field, Medication field and a HbA1c field.</p> */
export interface GlucoseMeasurementContext {
    /**
     * <p>Format: `uint8`</p>
     * <p>C2: Field exists if the key of bit 0 of the Flags field is set to 1</p>
     * | Key | Description             |
     * | --- | ----------------------- |
     * | 0   | Reserved for future use |
     * | 1   | Breakfast               |
     * | 2   | Lunch                   |
     * | 3   | Dinner                  |
     * | 4   | Snack                   |
     * | 5   | Drink                   |
     * | 6   | Supper                  |
     * | 7   | Brunch                  |
     *
     * <p>Reserved for future use: 8 to 255</p>
     */
    carbohydrateID?: number | undefined;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.mass.kilogram`</p>
     * <p>C2: Field exists if the key of bit 0 of the Flags field is set to 1</p>
     */
    carbohydrateUnitsOfKilograms?: number | undefined;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.time.second`</p>
     * <p>C5: Field exists if the key of bit 3 of the Flags field is set to 1</p>
     * | Key   | Description |
     * | ----- | ----------- |
     * | 65535 | Overrun     |
     *
     */
    exerciseDuration?: number | undefined;
    /**
     * <p>Format: `uint8`</p>
     * <p>Unit: `org.bluetooth.unit.percentage`</p>
     * <p>C5: Field exists if the key of bit 3 of the Flags field is set to 1</p>
     */
    exerciseIntensity?: number | undefined;
    /**
     * <p>Format: `8bit`</p>
     * <p>C1: Field exists if the key of bit 7 of the Flags field is set to 1</p>
     *
     * Bit field:
     *
     * | index | size | name                    |
     * | ----- | ---- | ----------------------- |
     * | 0     | 8    | Reserved for future use |
     *
     */
    extendedFlags?: number | undefined;
    /**
     * <p>Format: `8bit`</p>
     * <p>These flags define which data fields are present in the Characteristic value</p>
     *
     * Bit field:
     *
     * | index | size | req    | name                                             |
     * | ----- | ---- | ------ | ------------------------------------------------ |
     * | 0     | 1    | C2     | Carbohydrate ID And Carbohydrate Present         |
     * | 1     | 1    | C3     | Meal Present                                     |
     * | 2     | 1    | C4     | Tester-Health Present                            |
     * | 3     | 1    | C5     | Exercise Duration And Exercise Intensity Present |
     * | 4     | 1    | C6     | Medication ID And Medication Present             |
     * | 5     | 1    | C8, C9 | Medication Value Units                           |
     * | 6     | 1    | C7     | HbA1c Present                                    |
     * | 7     | 1    | C1     | Extended Flags Present                           |
     *
     */
    flags: number;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.percentage`</p>
     * <p>C7: Field exists if the key of bit 6 of the Flags field is set to 1</p>
     */
    hba1c?: number | undefined;
    /**
     * <p>Format: `nibble`</p>
     * <p>C4: Field exists if the key of bit 2 of the Flags field is set to 1</p>
     * | Key | Description                |
     * | --- | -------------------------- |
     * | 0   | Reserved for future use    |
     * | 1   | Minor health issues        |
     * | 2   | Major health issues        |
     * | 3   | During menses              |
     * | 4   | Under stress               |
     * | 5   | No health issues           |
     * | 15  | Health value not available |
     *
     * <p>Reserved for future use: 6 to 14</p>
     */
    health?: number | undefined;
    /**
     * <p>Format: `uint8`</p>
     * <p>C3: Field exists if the key of bit 1 of the Flags field is set to 1</p>
     * | Key | Description                   |
     * | --- | ----------------------------- |
     * | 0   | Reserved for future use       |
     * | 1   | Preprandial (before meal)     |
     * | 2   | Postprandial (after meal)     |
     * | 3   | Fasting                       |
     * | 4   | Casual (snacks, drinks, etc.) |
     * | 5   | Bedtime                       |
     *
     * <p>Reserved for future use: 6 to 255</p>
     */
    meal?: number | undefined;
    /**
     * <p>Format: `uint8`</p>
     * <p>C6: Field exists if the key of bit 4 of the Flags field is set to 1</p>
     * | Key | Description                 |
     * | --- | --------------------------- |
     * | 0   | Reserved for future use     |
     * | 1   | Rapid acting insulin        |
     * | 2   | Short acting insulin        |
     * | 3   | Intermediate acting insulin |
     * | 4   | Long acting insulin         |
     * | 5   | Pre-mixed insulin           |
     *
     * <p>Reserved for future use: 6 to 255</p>
     */
    medicationID?: number | undefined;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.mass.kilogram`</p>
     * <p>C6: Field exists if the key of bit 4 of the Flags field is set to 1, C8: Field exists if the key of bit 5 of the Flags field is set to 0</p>
     */
    medicationUnitsOfKilograms?: number | undefined;
    /**
     * <p>Format: `SFLOAT`</p>
     * <p>Unit: `org.bluetooth.unit.volume.litre`</p>
     * <p>C6: Field exists if the key of bit 4 of the Flags field is set to 1, C9: Field exists if the key of bit 5 of the Flags field is set to 1</p>
     */
    medicationUnitsOfLiters?: number | undefined;
    /** <p>Format: `uint16`</p> */
    sequenceNumber: number;
    /**
     * <p>Format: `nibble`</p>
     * <p>C4: Field exists if the key of bit 2 of the Flags field is set to 1</p>
     * | Key | Description                |
     * | --- | -------------------------- |
     * | 0   | Reserved for future use    |
     * | 1   | Self                       |
     * | 2   | Health Care Professional   |
     * | 3   | Lab test                   |
     * | 15  | Tester value not available |
     *
     * <p>Reserved for future use: 4 to 14</p>
     */
    tester?: number | undefined;
}

/**
 * Where fields with the format ?nibble? have been defined in the above table, the fields are shown in the order of Least Significant Nibble first, when reading the table from top to bottom. Where the characteristic definition contains two adjacent nibbles and the service specification has defined that that pair of nibbles comprise a single octet, the Least Significant Nibble means the four bits numbered 0, 1, 2 and 3 of the octet and the Most Significant Nibble means the four bits numbered 4, 5, 6 and 7 of that octet.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.glucose_measurement_context.xml | Glucose Measurement Context}
 */
export class GlucoseMeasurementContextImpl implements GlucoseMeasurementContext {
    public static readonly UUID_PREFIX = 0x2a34;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.glucose_measurement_context";
    public static readonly NAME = "Glucose Measurement Context";

    /** Parse from a DataView into {@link GlucoseMeasurementContext}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): GlucoseMeasurementContextImpl {
        return new GlucoseMeasurementContextImpl(glucoseMeasurementContextFromDataView(dataView, indexStart));
    }

    public readonly carbohydrateID?: number | undefined;
    public readonly carbohydrateUnitsOfKilograms?: number | undefined;
    public readonly exerciseDuration?: number | undefined;
    public readonly exerciseIntensity?: number | undefined;
    public readonly extendedFlags?: number | undefined;
    public readonly flags: number;
    public readonly hba1c?: number | undefined;
    public readonly health?: number | undefined;
    public readonly meal?: number | undefined;
    public readonly medicationID?: number | undefined;
    public readonly medicationUnitsOfKilograms?: number | undefined;
    public readonly medicationUnitsOfLiters?: number | undefined;
    public readonly sequenceNumber: number;
    public readonly tester?: number | undefined;

    public constructor(glucoseMeasurementContext: GlucoseMeasurementContext) {
        this.carbohydrateID = glucoseMeasurementContext.carbohydrateID;
        this.carbohydrateUnitsOfKilograms = glucoseMeasurementContext.carbohydrateUnitsOfKilograms;
        this.exerciseDuration = glucoseMeasurementContext.exerciseDuration;
        this.exerciseIntensity = glucoseMeasurementContext.exerciseIntensity;
        this.extendedFlags = glucoseMeasurementContext.extendedFlags;
        this.flags = glucoseMeasurementContext.flags;
        this.hba1c = glucoseMeasurementContext.hba1c;
        this.health = glucoseMeasurementContext.health;
        this.meal = glucoseMeasurementContext.meal;
        this.medicationID = glucoseMeasurementContext.medicationID;
        this.medicationUnitsOfKilograms = glucoseMeasurementContext.medicationUnitsOfKilograms;
        this.medicationUnitsOfLiters = glucoseMeasurementContext.medicationUnitsOfLiters;
        this.sequenceNumber = glucoseMeasurementContext.sequenceNumber;
        this.tester = glucoseMeasurementContext.tester;
    }
}

/** Parse from a DataView into {@link GlucoseMeasurementContext}. */
export function glucoseMeasurementContextFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): GlucoseMeasurementContext {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const flags = $dvr.uint8();
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C2  | True        |
     * <p>Requirements: C2</p>
     */
    const carbohydrateIDAndCarbohydratePresent = !!(flags & 0b0000_0001);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C3  | True        |
     * <p>Requirements: C3</p>
     */
    const mealPresent = !!((flags & 0b0000_0010) >> 1);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C4  | True        |
     * <p>Requirements: C4</p>
     */
    const testerHealthPresent = !!((flags & 0b0000_0100) >> 2);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C5  | True        |
     * <p>Requirements: C5</p>
     */
    const exerciseDurationAndExerciseIntensityPresent = !!((flags & 0b0000_1000) >> 3);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C6  | True        |
     * <p>Requirements: C6</p>
     */
    const medicationIDAndMedicationPresent = !!((flags & 0b0001_0000) >> 4);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     | C8  | kilograms   |
     * | 1     | C9  | liters      |
     * <p>Requirements: C8, C9</p>
     */
    const medicationValueUnits = !!((flags & 0b0010_0000) >> 5);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C7  | True        |
     * <p>Requirements: C7</p>
     */
    const hba1cPresent = !!((flags & 0b0100_0000) >> 6);
    /**
     * | value | req | description |
     * | ----- | --- | ----------- |
     * | 0     |     | False       |
     * | 1     | C1  | True        |
     * <p>Requirements: C1</p>
     */
    const extendedFlagsPresent = !!((flags & 0b1000_0000) >> 7);
    const sequenceNumber = $dvr.uint16();
    let extendedFlags: number | undefined = undefined;
    if (extendedFlagsPresent) {
        extendedFlags = $dvr.uint8();
    }

    /** */
    /**
     * | value | description             |
     * | ----- | ----------------------- |
     * | 0     | Reserved for future use |
     * | 1     | Breakfast               |
     * | 2     | Lunch                   |
     * | 3     | Dinner                  |
     * | 4     | Snack                   |
     * | 5     | Drink                   |
     * | 6     | Supper                  |
     * | 7     | Brunch                  |
     */
    let carbohydrateID: number | undefined = undefined;
    if (carbohydrateIDAndCarbohydratePresent) {
        carbohydrateID = $dvr.uint8();
    }

    let carbohydrateUnitsOfKilograms: number | undefined = undefined;
    if (carbohydrateIDAndCarbohydratePresent) {
        carbohydrateUnitsOfKilograms = $dvr.float16();
    }

    /** */
    /**
     * | value | description                   |
     * | ----- | ----------------------------- |
     * | 0     | Reserved for future use       |
     * | 1     | Preprandial (before meal)     |
     * | 2     | Postprandial (after meal)     |
     * | 3     | Fasting                       |
     * | 4     | Casual (snacks, drinks, etc.) |
     * | 5     | Bedtime                       |
     */
    let meal: number | undefined = undefined;
    if (mealPresent) {
        meal = $dvr.uint8();
    }

    /** */
    /**
     * | value | description                |
     * | ----- | -------------------------- |
     * | 0     | Reserved for future use    |
     * | 1     | Self                       |
     * | 2     | Health Care Professional   |
     * | 3     | Lab test                   |
     * | 15    | Tester value not available |
     */
    let tester: number | undefined = undefined;
    if (testerHealthPresent) {
        tester = $dvr.nibble();
    }

    /** */
    /**
     * | value | description                |
     * | ----- | -------------------------- |
     * | 0     | Reserved for future use    |
     * | 1     | Minor health issues        |
     * | 2     | Major health issues        |
     * | 3     | During menses              |
     * | 4     | Under stress               |
     * | 5     | No health issues           |
     * | 15    | Health value not available |
     */
    let health: number | undefined = undefined;
    if (testerHealthPresent) {
        health = $dvr.nibble();
    }

    /** */
    /**
     * | value | description |
     * | ----- | ----------- |
     * | 65535 | Overrun     |
     */
    let exerciseDuration: number | undefined = undefined;
    if (exerciseDurationAndExerciseIntensityPresent) {
        exerciseDuration = $dvr.uint16();
    }

    let exerciseIntensity: number | undefined = undefined;
    if (exerciseDurationAndExerciseIntensityPresent) {
        exerciseIntensity = $dvr.uint8();
    }

    /** */
    /**
     * | value | description                 |
     * | ----- | --------------------------- |
     * | 0     | Reserved for future use     |
     * | 1     | Rapid acting insulin        |
     * | 2     | Short acting insulin        |
     * | 3     | Intermediate acting insulin |
     * | 4     | Long acting insulin         |
     * | 5     | Pre-mixed insulin           |
     */
    let medicationID: number | undefined = undefined;
    if (medicationIDAndMedicationPresent) {
        medicationID = $dvr.uint8();
    }

    let medicationUnitsOfKilograms: number | undefined = undefined;
    if (medicationIDAndMedicationPresent && !medicationValueUnits) {
        medicationUnitsOfKilograms = $dvr.float16();
    }

    let medicationUnitsOfLiters: number | undefined = undefined;
    if (medicationIDAndMedicationPresent && medicationValueUnits) {
        medicationUnitsOfLiters = $dvr.float16();
    }

    let hba1c: number | undefined = undefined;
    if (hba1cPresent) {
        hba1c = $dvr.float16();
    }

    return { carbohydrateID, carbohydrateUnitsOfKilograms, exerciseDuration, exerciseIntensity, extendedFlags, flags, hba1c, health, meal, medicationID, medicationUnitsOfKilograms, medicationUnitsOfLiters, sequenceNumber, tester };
}
