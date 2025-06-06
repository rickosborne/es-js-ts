import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.supported_power_range.xml
/** <p>The Supported Power Range characteristic is used to send the supported power range as well as the minimum power increment supported by the Server.</p> */
export interface SupportedPowerRange {
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.power.watt`</p>
     * <p>Watt with a resolution of 1</p>
     */
    maximumPower: number;
    /**
     * <p>Format: `uint16`</p>
     * <p>Unit: `org.bluetooth.unit.power.watt`</p>
     * <p>Watt with a resolution of 1</p>
     */
    minimumIncrement: number;
    /**
     * <p>Format: `sint16`</p>
     * <p>Unit: `org.bluetooth.unit.power.watt`</p>
     * <p>Watt with a resolution of 1</p>
     */
    minimumPower: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.supported_power_range.xml | Supported Power Range} */
export class SupportedPowerRangeImpl implements SupportedPowerRange {
    public static readonly UUID_PREFIX = 0x2ad8;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.supported_power_range";
    public static readonly NAME = "Supported Power Range";

    /** Parse from a DataView into {@link SupportedPowerRange}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): SupportedPowerRangeImpl {
        return new SupportedPowerRangeImpl(supportedPowerRangeFromDataView(dataView, indexStart));
    }

    public readonly maximumPower: number;
    public readonly minimumIncrement: number;
    public readonly minimumPower: number;

    public constructor(supportedPowerRange: SupportedPowerRange) {
        this.maximumPower = supportedPowerRange.maximumPower;
        this.minimumIncrement = supportedPowerRange.minimumIncrement;
        this.minimumPower = supportedPowerRange.minimumPower;
    }
}

/** Parse from a DataView into {@link SupportedPowerRange}. */
export function supportedPowerRangeFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): SupportedPowerRange {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const minimumPower = $dvr.int16();
    const maximumPower = $dvr.int16();
    const minimumIncrement = $dvr.uint16();
    return { maximumPower, minimumIncrement, minimumPower };
}
