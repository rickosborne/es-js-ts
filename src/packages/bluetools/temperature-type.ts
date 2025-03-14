import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.temperature_type.xml
/**
 * <p>The Temperature Type characteristic is an enumeration that indicates where the temperature was measured.</p>
 * <p>These Temperature Type values correspond to the Temperature Type descriptions used in ISO/IEEE 11073-10408-2008.</p>
 */
export interface TemperatureType {
    /**
     * <p>Format: `8bit`</p>
     * | Key | Description             |
     * | --- | ----------------------- |
     * | 1   | Armpit                  |
     * | 2   | Body (general)          |
     * | 3   | Ear (usually ear lobe)  |
     * | 4   | Finger                  |
     * | 5   | Gastro-intestinal Tract |
     * | 6   | Mouth                   |
     * | 7   | Rectum                  |
     * | 8   | Toe                     |
     * | 9   | Tympanum (ear drum)     |
     *
     * <p>Reserved for future use: 0 to -1</p>
     */
    temperatureTextDescription: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.temperature_type.xml | Temperature Type} */
export class TemperatureTypeImpl implements TemperatureType {
    public static readonly UUID_PREFIX = 0x2a1d;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.temperature_type";
    public static readonly NAME = "Temperature Type";

    /** Parse from a DataView into {@link TemperatureType}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): TemperatureTypeImpl {
        return new TemperatureTypeImpl(temperatureTypeFromDataView(dataView, indexStart));
    }

    public readonly temperatureTextDescription: number;

    public constructor(temperatureType: TemperatureType) {
        this.temperatureTextDescription = temperatureType.temperatureTextDescription;
    }
}

/** Parse from a DataView into {@link TemperatureType}. */
export function temperatureTypeFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): TemperatureType {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description             |
     * | ----- | ----------------------- |
     * | 1     | Armpit                  |
     * | 2     | Body (general)          |
     * | 3     | Ear (usually ear lobe)  |
     * | 4     | Finger                  |
     * | 5     | Gastro-intestinal Tract |
     * | 6     | Mouth                   |
     * | 7     | Rectum                  |
     * | 8     | Toe                     |
     * | 9     | Tympanum (ear drum)     |
     */
    const temperatureTextDescription = $dvr.uint8();
    return { temperatureTextDescription };
}
