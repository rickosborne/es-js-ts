import { type DataViewReader, dataViewReader } from "./data-view-reader.js";

// This file is autogenerated.
// Do not edit it by hand, as changes will be lost.
// Upstream source: https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.language.xml
export interface Language {
    /**
     * <p>Format: `utf8s`</p>
     * <p>Unit: `org.bluetooth.unit.unitless`</p>
     * <p>The Language definition is based on ISO639-1.</p>
     */
    language: string;
}

/** @see {@link https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.characteristic.language.xml | Language} */
export class LanguageImpl implements Language {
    public static readonly UUID_PREFIX = 0x2aa2;
    public static readonly TYPE_NAME = "org.bluetooth.characteristic.language";
    public static readonly NAME = "Language";

    /** Parse from a DataView into {@link Language}. */
    public static fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): LanguageImpl {
        return new LanguageImpl(languageFromDataView(dataView, indexStart));
    }

    public readonly language: string;

    public constructor(language: Language) {
        this.language = language.language;
    }
}

/** Parse from a DataView into {@link Language}. */
export function languageFromDataView(dataView: DataView | DataViewReader, indexStart: number = 0): Language {
    const $dvr: DataViewReader = dataViewReader(dataView, indexStart);
    const language = $dvr.utf8s();
    return { language };
}
