import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.last_name.xml
/** <p>Last name of the user. See Note below.</p> */
export interface LastName {
    /**
     * <p>Format: `utf8s`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     */
    lastName: string;
}

/**
 * The length of the utf8s-based UDS Characteristic is variable and may exceed the default ATT_MTU defined in the Core Specification.
 * @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.last_name.xml | Last Name}
 */
export class LastNameImpl implements LastName {
    public static readonly UUID_PREFIX = 0x2a90;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.last_name";
    public static readonly NAME = "Last Name";

    /** Parse from a DataView into {@link LastName}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): LastNameImpl {
        return new LastNameImpl(lastNameFromDataView(dataView, indexStart));
    }

    public readonly lastName: string;

    public constructor(lastName: LastName) {
        this.lastName = lastName.lastName;
    }
}

/** Parse from a DataView into {@link LastName}. */
export function lastNameFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): LastName {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const lastName = $dvr.utf8s();
    return { lastName };
}
