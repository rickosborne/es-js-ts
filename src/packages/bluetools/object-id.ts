import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.object_id.xml
export interface ObjectId {
    /**
     * <p>Format: `uint48`</p>
     * | Key | Description                               |
     * | --- | ----------------------------------------- |
     * | 0   | Reserved for the Directory Listing Object |
     *
     * <p>Reserved for future use: 1 to 255</p>
     */
    objectID: number;
}

/**
 * The fields in the above table, reading from top to bottom, are shown in the order of LSO to MSO, where LSO = Least Significant Octet and MSO = Most Significant Octet.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.object_id.xml | Object Id}
 */
export class ObjectIdImpl implements ObjectId {
    public static readonly UUID_PREFIX = 0x2ac3;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.object_id";
    public static readonly NAME = "Object ID";

    /** Parse from a DataView into {@link ObjectId}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): ObjectIdImpl {
        return new ObjectIdImpl(objectIdFromDataView(dataView, indexStart));
    }

    public readonly objectID: number;

    public constructor(objectId: ObjectId) {
        this.objectID = objectId.objectID;
    }
}

/** Parse from a DataView into {@link ObjectId}. */
export function objectIdFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): ObjectId {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    /** */
    /**
     * | value | description                               |
     * | ----- | ----------------------------------------- |
     * | 0     | Reserved for the Directory Listing Object |
     */
    const objectID = $dvr.uint48();
    return { objectID };
}
