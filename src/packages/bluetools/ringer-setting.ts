import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.ringer_setting.xml
/**
 * <p>Value 0, meaning ?Ringer Silent"</p>
 * <p>Value 1, meaning ?Ringer Normal?</p>
 * <p>The value 0x01 shall be interpreted as ?Ringer Normal?</p>
 */
export interface RingerSetting {
    /**
     * <p>Format: `8bit`</p>
     * <p>Minimum: 0</p>
     * <p>Maximum: 1</p>
     * | Key | Description   |
     * | --- | ------------- |
     * | 0   | Ringer Silent |
     * | 1   | Ringer Normal |
     *
     * <p>Reserved for future use: 2 to 255</p>
     */
    ringerSetting: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.ringer_setting.xml | Ringer Setting} */
export class RingerSettingImpl implements RingerSetting {
    public static readonly UUID_PREFIX = 0x2a41;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.ringer_setting";
    public static readonly NAME = "Ringer Setting";

    /** Parse from a DataView into {@link RingerSetting}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): RingerSettingImpl {
        return new RingerSettingImpl(ringerSettingFromDataView(dataView, indexStart));
    }

    public readonly ringerSetting: number;

    public constructor(ringerSetting: RingerSetting) {
        this.ringerSetting = ringerSetting.ringerSetting;
    }
}

/** Parse from a DataView into {@link RingerSetting}. */
export function ringerSettingFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): RingerSetting {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description   |
     * | ----- | ------------- |
     * | 0     | Ringer Silent |
     * | 1     | Ringer Normal |
     */
    const ringerSetting = $dvr.uint8();
    return { ringerSetting };
}
