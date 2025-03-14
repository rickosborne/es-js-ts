import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.uri.xml
/** <p>The Uniform Resource Identifier (URI) Characteristic is used to configure the URI for a subsequent request.</p> */
export interface Uri {
    /**
     * <p>Format: `utf8s`</p>
     * <p>The URI to be used in the HTTP request.</p>
     */
    uri: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.uri.xml | Uri} */
export class UriImpl implements Uri {
    public static readonly UUID_PREFIX = 0x2ab6;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.uri";
    public static readonly NAME = "URI";

    /** Parse from a DataView into {@link Uri}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): UriImpl {
        return new UriImpl(uriFromDataView(dataView, indexStart));
    }

    public readonly uri: string;

    public constructor(uri: Uri) {
        this.uri = uri.uri;
    }
}

/** Parse from a DataView into {@link Uri}. */
export function uriFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Uri {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const uri = $dvr.utf8s();
    return { uri };
}
