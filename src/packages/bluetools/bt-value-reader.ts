import { BatteryLevelImpl } from "./battery-level.js";
import { CrossTrainerDataImpl } from "./cross-trainer-data.js";
import { CscFeatureImpl } from "./csc-feature.js";
import { CscMeasurementImpl } from "./csc-measurement.js";
import { CurrentTimeImpl } from "./current-time.js";
import type { DataViewReader } from "./data-view-reader.js";
import { DateTimeImpl } from "./date-time.js";
import { DayDateTimeImpl } from "./day-date-time.js";
import { DayOfWeekImpl } from "./day-of-week.js";
import { DstOffsetImpl } from "./dst-offset.js";
import { ElevationImpl } from "./elevation.js";
import { ExactTime256Impl } from "./exact-time-256.js";
import { FirmwareRevisionStringImpl } from "./firmware-revision-string.js";
import { FiveZoneHeartRateLimitsImpl } from "./five-zone-heart-rate-limits.js";
import { GattCharacteristicPresentationFormatImpl } from "./gatt-characteristic-presentation-format.js";
import { GlucoseFeatureImpl } from "./glucose-feature.js";
import { GlucoseMeasurementContextImpl } from "./glucose-measurement-context.js";
import { GlucoseMeasurementImpl } from "./glucose-measurement.js";
import { HardwareRevisionStringImpl } from "./hardware-revision-string.js";
import { HeartRateControlPointImpl } from "./heart-rate-control-point.js";
import { HeartRateMaxImpl } from "./heart-rate-max.js";
import { HeartRateMeasurementImpl } from "./heart-rate-measurement.js";
import { IndoorBikeDataImpl } from "./indoor-bike-data.js";
import { LanguageImpl } from "./language.js";
import { LatitudeImpl } from "./latitude.js";
import { LocalTimeInformationImpl } from "./local-time-information.js";
import { LocationAndSpeedImpl } from "./location-and-speed.js";
import { LocationNameImpl } from "./location-name.js";
import { LongitudeImpl } from "./longitude.js";
import { ManufacturerNameStringImpl } from "./manufacturer-name-string.js";
import { MaximumRecommendedHeartRateImpl } from "./maximum-recommended-heart-rate.js";
import { MeasurementIntervalImpl } from "./measurement-interval.js";
import { ModelNumberStringImpl } from "./model-number-string.js";
import { NavigationImpl } from "./navigation.js";
import { NumberOfDigitalsImpl } from "./number-of-digitals.js";
import { PlxContinuousMeasurementImpl } from "./plx-continuous-measurement.js";
import { PlxFeaturesImpl } from "./plx-features.js";
import { PlxSpotCheckMeasurementImpl } from "./plx-spot-check-measurement.js";
import { ReferenceTimeInformationImpl } from "./reference-time-information.js";
import { RestingHeartRateImpl } from "./resting-heart-rate.js";
import { RscFeatureImpl } from "./rsc-feature.js";
import { RscMeasurementImpl } from "./rsc-measurement.js";
import { SensorLocationImpl } from "./sensor-location.js";
import { SerialNumberStringImpl } from "./serial-number-string.js";
import { SoftwareRevisionStringImpl } from "./software-revision-string.js";
import { SupportedHeartRateRangeImpl } from "./supported-heart-rate-range.js";
import { SupportedInclinationRangeImpl } from "./supported-inclination-range.js";
import { SupportedSpeedRangeImpl } from "./supported-speed-range.js";
import { SystemIdImpl } from "./system-id.js";
import { TemperatureMeasurementImpl } from "./temperature-measurement.js";
import { TemperatureTypeImpl } from "./temperature-type.js";
import { TemperatureImpl } from "./temperature.js";
import { ThreeZoneHeartRateLimitsImpl } from "./three-zone-heart-rate-limits.js";
import { TimeAccuracyImpl } from "./time-accuracy.js";
import { TimeSourceImpl } from "./time-source.js";
import { TimeUpdateControlPointImpl } from "./time-update-control-point.js";
import { TimeUpdateStateImpl } from "./time-update-state.js";
import { TimeWithDstImpl } from "./time-with-dst.js";
import { TimeZoneImpl } from "./time-zone.js";
import { TreadmillDataImpl } from "./treadmill-data.js";
import { TwoZoneHeartRateLimitImpl } from "./two-zone-heart-rate-limit.js";
import { Vo2MaxImpl } from "./vo2-max.js";

export interface BtReaderClass {
	readonly NAME: string;
	readonly TYPE_NAME: string;
	readonly UUID_PREFIX: number;
	readonly name: string;

	fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): object;
}

export const BT_READERS: readonly BtReaderClass[] = Object.freeze([
	BatteryLevelImpl,
	CrossTrainerDataImpl,
	CscFeatureImpl,
	CscMeasurementImpl,
	CurrentTimeImpl,
	DateTimeImpl,
	DayDateTimeImpl,
	DayOfWeekImpl,
	DstOffsetImpl,
	ElevationImpl,
	ExactTime256Impl,
	FirmwareRevisionStringImpl,
	FiveZoneHeartRateLimitsImpl,
	GattCharacteristicPresentationFormatImpl,
	GlucoseFeatureImpl,
	GlucoseMeasurementContextImpl,
	GlucoseMeasurementImpl,
	HardwareRevisionStringImpl,
	HeartRateControlPointImpl,
	HeartRateMaxImpl,
	HeartRateMeasurementImpl,
	IndoorBikeDataImpl,
	LanguageImpl,
	LatitudeImpl,
	LocalTimeInformationImpl,
	LocationAndSpeedImpl,
	LocationNameImpl,
	LongitudeImpl,
	ManufacturerNameStringImpl,
	MaximumRecommendedHeartRateImpl,
	MeasurementIntervalImpl,
	ModelNumberStringImpl,
	NavigationImpl,
	NumberOfDigitalsImpl,
	PlxContinuousMeasurementImpl,
	PlxFeaturesImpl,
	PlxSpotCheckMeasurementImpl,
	ReferenceTimeInformationImpl,
	RestingHeartRateImpl,
	RscFeatureImpl,
	RscMeasurementImpl,
	SensorLocationImpl,
	SerialNumberStringImpl, SoftwareRevisionStringImpl,
	SupportedHeartRateRangeImpl,
	SupportedInclinationRangeImpl,
	SupportedSpeedRangeImpl,
	SystemIdImpl,
	TemperatureImpl,
	TemperatureMeasurementImpl,
	TemperatureTypeImpl,
	ThreeZoneHeartRateLimitsImpl,
	TimeAccuracyImpl,
	TimeSourceImpl,
	TimeUpdateControlPointImpl,
	TimeUpdateStateImpl,
	TimeWithDstImpl,
	TimeZoneImpl,
	TreadmillDataImpl,
	TwoZoneHeartRateLimitImpl,
	Vo2MaxImpl,
]);

export const btValueReaderFor = (idOrName: string | number): BtReaderClass | undefined => {
	let id: number = 0;
	let name: string = "(unknown)";
	if (typeof idOrName === "string") {
		if (idOrName.startsWith("0000")) {
			id = Number.parseInt(idOrName.substring(0, 8), 16);
		} else {
			name = idOrName;
		}
	} else {
		id = idOrName;
	}
	const readers = BT_READERS.filter((r) => r.UUID_PREFIX === id || r.NAME === name || r.TYPE_NAME === name || r.TYPE_NAME.endsWith(name));
	if (readers.length > 1) {
		throw new Error(`More than one match: ${ readers.map((r) => r.name).join(" ") }`);
	}
	return readers.at(0);
};
