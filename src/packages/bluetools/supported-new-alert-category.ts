import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type AlertCategoryIdBitMask, AlertCategoryIdBitMaskImpl } from "./alert-category-id-bit-mask.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.supported_new_alert_category.xml
/**
 * <p>Category that the server supports for new alert.</p>
 * <p>The value 0x0a is interpreted that this server supports ?Call? and ?Email? categories.</p>
 * <p>This characteristic uses the Alert Category ID Bit Mask Characteristic. If bit(s) is/are set, it means the server supports the corresponded categories for new incoming alert.</p>
 */
export interface SupportedNewAlertCategory {
    categoryIDBitMask: AlertCategoryIdBitMask;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.supported_new_alert_category.xml | Supported New Alert Category} */
export class SupportedNewAlertCategoryImpl implements SupportedNewAlertCategory {
    public static readonly UUID_PREFIX = 0x2a47;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.supported_new_alert_category";
    public static readonly NAME = "Supported New Alert Category";

    /** Parse from a DataView into {@link SupportedNewAlertCategory}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): SupportedNewAlertCategoryImpl {
        return new SupportedNewAlertCategoryImpl(supportedNewAlertCategoryFromDataView(dataView, indexStart));
    }

    public readonly categoryIDBitMask: AlertCategoryIdBitMask;

    public constructor(supportedNewAlertCategory: SupportedNewAlertCategory) {
        this.categoryIDBitMask = supportedNewAlertCategory.categoryIDBitMask;
    }
}

/** Parse from a DataView into {@link SupportedNewAlertCategory}. */
export function supportedNewAlertCategoryFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): SupportedNewAlertCategory {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const categoryIDBitMask = AlertCategoryIdBitMaskImpl.fromDataView($dvr);
    return { categoryIDBitMask };
}
