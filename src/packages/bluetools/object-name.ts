import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.object_name.xml
export interface ObjectName {
    /**
     * <p>The length of the field value is variable from 0 octets to 120 octets.</p>
     * <p>Format: `utf8s`</p>
     * <p>The length of the field value is variable from 0 octets to 120 octets.</p>
     */
    objectName: string;
}

/**
 * Characters which require more than one octet when encoded in UTF-8 are transmitted with the leading byte first, followed by the continuation bytes ordered in accordance with UTF-8 encoding. In UTF-8, the leading byte is identified by possessing two or more high-order 1?s followed by a 0 while continuation bytes all have '10' in the high-order position. Strings which consist of more than one character are transmitted in the following order: the character which appears furthest to the left when the string is presented in its written form shall be sent first, followed by the remaining characters in order.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.object_name.xml | Object Name}
 */
export class ObjectNameImpl implements ObjectName {
    public static readonly UUID_PREFIX = 0x2abe;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.object_name";
    public static readonly NAME = "Object Name";

    /** Parse from a DataView into {@link ObjectName}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): ObjectNameImpl {
        return new ObjectNameImpl(objectNameFromDataView(dataView, indexStart));
    }

    public readonly objectName: string;

    public constructor(objectName: ObjectName) {
        this.objectName = objectName.objectName;
    }
}

/** Parse from a DataView into {@link ObjectName}. */
export function objectNameFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): ObjectName {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const objectName = $dvr.utf8s();
    return { objectName };
}
