import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.temperature.xml
export interface Temperature {
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.thermodynamic_temperature.degree_celsius`</p>
     * <p>Unit is in degrees Celsius with a resolution of 0.01 degrees Celsius</p>
     */
    temperature: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.temperature.xml | Temperature} */
export class TemperatureImpl implements Temperature {
    public static readonly UUID_PREFIX = 0x2a6e;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.temperature";
    public static readonly NAME = "Temperature";

    /** Parse from a DataView into {@link Temperature}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): TemperatureImpl {
        return new TemperatureImpl(temperatureFromDataView(dataView, indexStart));
    }

    public readonly temperature: number;

    public constructor(temperature: Temperature) {
        this.temperature = temperature.temperature;
    }
}

/** Parse from a DataView into {@link Temperature}. */
export function temperatureFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Temperature {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const temperature = $dvr.int16();
    return { temperature };
}
