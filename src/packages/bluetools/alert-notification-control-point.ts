import { type DataViewReader, dataViewReader } from "./data-view-reader.js";
import { type AlertCategoryId, AlertCategoryIdImpl } from "./alert-category-id.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.alert_notification_control_point.xml
/**
 * <p>Control point of the Alert Notification server. Client can write the command here to request the several functions toward the server.</p>
 * <p>The data 0x02 0x01 interprets ?Disable New Incoming Notification for Email Category?.</p>
 * <p>The 2nd octet value of the characteristic is an ?Alert Category ID? format. This octet shows the target category that the command ID applies for.</p>
 */
export interface AlertNotificationControlPoint {
    /** <p>Target category that the command applies to.</p> */
    categoryID: AlertCategoryId;
    /**
     * <p>Format: `uint8`</p>
     * | Key | Description                                 |
     * | --- | ------------------------------------------- |
     * | 0   | Enable New Incoming Alert Notification      |
     * | 1   | Enable Unread Category Status Notification  |
     * | 2   | Disable New Incoming Alert Notification     |
     * | 3   | Disable Unread Category Status Notification |
     * | 4   | Notify New Incoming Alert immediately       |
     * | 5   | Notify Unread Category Status immediately   |
     *
     * <p>Reserved for future use: 6 to 255</p>
     */
    commandID: number;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.alert_notification_control_point.xml | Alert Notification Control Point} */
export class AlertNotificationControlPointImpl implements AlertNotificationControlPoint {
    public static readonly UUID_PREFIX = 0x2a44;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.alert_notification_control_point";
    public static readonly NAME = "Alert Notification Control Point";

    /** Parse from a DataView into {@link AlertNotificationControlPoint}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): AlertNotificationControlPointImpl {
        return new AlertNotificationControlPointImpl(alertNotificationControlPointFromDataView(dataView, indexStart));
    }

    public readonly categoryID: AlertCategoryId;
    public readonly commandID: number;

    public constructor(alertNotificationControlPoint: AlertNotificationControlPoint) {
        this.categoryID = alertNotificationControlPoint.categoryID;
        this.commandID = alertNotificationControlPoint.commandID;
    }
}

/** Parse from a DataView into {@link AlertNotificationControlPoint}. */
export function alertNotificationControlPointFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): AlertNotificationControlPoint {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description                                 |
     * | ----- | ------------------------------------------- |
     * | 0     | Enable New Incoming Alert Notification      |
     * | 1     | Enable Unread Category Status Notification  |
     * | 2     | Disable New Incoming Alert Notification     |
     * | 3     | Disable Unread Category Status Notification |
     * | 4     | Notify New Incoming Alert immediately       |
     * | 5     | Notify Unread Category Status immediately   |
     */
    const commandID = $dvr.uint8();
    const categoryID = AlertCategoryIdImpl.fromDataView($dvr);
    return { categoryID, commandID };
}
