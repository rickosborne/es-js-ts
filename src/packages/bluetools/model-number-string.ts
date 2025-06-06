import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.model_number_string.xml
/** <p>The value of this characteristic is a UTF-8 string representing the model number assigned by the device vendor.</p> */
export interface ModelNumberString {
    /** <p>Format: `utf8s`</p> */
    modelNumber: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.model_number_string.xml | Model Number String} */
export class ModelNumberStringImpl implements ModelNumberString {
    public static readonly UUID_PREFIX = 0x2a24;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.model_number_string";
    public static readonly NAME = "Model Number String";

    /** Parse from a DataView into {@link ModelNumberString}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): ModelNumberStringImpl {
        return new ModelNumberStringImpl(modelNumberStringFromDataView(dataView, indexStart));
    }

    public readonly modelNumber: string;

    public constructor(modelNumberString: ModelNumberString) {
        this.modelNumber = modelNumberString.modelNumber;
    }
}

/** Parse from a DataView into {@link ModelNumberString}. */
export function modelNumberStringFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): ModelNumberString {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const modelNumber = $dvr.utf8s();
    return { modelNumber };
}
