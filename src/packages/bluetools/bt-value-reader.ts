import { AerobicHeartRateLowerLimitImpl } from "./aerobic-heart-rate-lower-limit.js";
import { AerobicHeartRateUpperLimitImpl } from "./aerobic-heart-rate-upper-limit.js";
import { AerobicThresholdImpl } from "./aerobic-threshold.js";
import { AgeImpl } from "./age.js";
import { AggregateImpl } from "./aggregate.js";
import { AlertCategoryIdBitMaskImpl } from "./alert-category-id-bit-mask.js";
import { AlertCategoryIdImpl } from "./alert-category-id.js";
import { AlertLevelImpl } from "./alert-level.js";
import { AlertNotificationControlPointImpl } from "./alert-notification-control-point.js";
import { AlertStatusImpl } from "./alert-status.js";
import { AltitudeImpl } from "./altitude.js";
import { AnaerobicHeartRateLowerLimitImpl } from "./anaerobic-heart-rate-lower-limit.js";
import { AnaerobicHeartRateUpperLimitImpl } from "./anaerobic-heart-rate-upper-limit.js";
import { AnaerobicThresholdImpl } from "./anaerobic-threshold.js";
import { AnalogImpl } from "./analog.js";
import { ApparentWindDirectionImpl } from "./apparent-wind-direction.js";
import { ApparentWindSpeedImpl } from "./apparent-wind-speed.js";
import { BarometricPressureTrendImpl } from "./barometric-pressure-trend.js";
import { BatteryLevelImpl } from "./battery-level.js";
import { BloodPressureFeatureImpl } from "./blood-pressure-feature.js";
import { BloodPressureMeasurementImpl } from "./blood-pressure-measurement.js";
import { BodyCompositionFeatureImpl } from "./body-composition-feature.js";
import { BodyCompositionMeasurementImpl } from "./body-composition-measurement.js";
import { BodySensorLocationImpl } from "./body-sensor-location.js";
import { BootKeyboardInputReportImpl } from "./boot-keyboard-input-report.js";
import { BootKeyboardOutputReportImpl } from "./boot-keyboard-output-report.js";
import { BootMouseInputReportImpl } from "./boot-mouse-input-report.js";
import { CgmFeatureImpl } from "./cgm-feature.js";
import { CrossTrainerDataImpl } from "./cross-trainer-data.js";
import { CscFeatureImpl } from "./csc-feature.js";
import { CscMeasurementImpl } from "./csc-measurement.js";
import { CurrentTimeImpl } from "./current-time.js";
import { CyclingPowerFeatureImpl } from "./cycling-power-feature.js";
import { CyclingPowerMeasurementImpl } from "./cycling-power-measurement.js";
import { CyclingPowerVectorImpl } from "./cycling-power-vector.js";
import type { DataViewReader } from "./data-view-reader.js";
import { DatabaseChangeIncrementImpl } from "./database-change-increment.js";
import { DateOfBirthImpl } from "./date-of-birth.js";
import { DateOfThresholdAssessmentImpl } from "./date-of-threshold-assessment.js";
import { DateTimeImpl } from "./date-time.js";
import { DayDateTimeImpl } from "./day-date-time.js";
import { DayOfWeekImpl } from "./day-of-week.js";
import { DewPointImpl } from "./dew-point.js";
import { DigitalImpl } from "./digital.js";
import { DstOffsetImpl } from "./dst-offset.js";
import { ElevationImpl } from "./elevation.js";
import { EmailAddressImpl } from "./email-address.js";
import { ExactTime256Impl } from "./exact-time-256.js";
import { FatBurnHeartRateLowerLimitImpl } from "./fat-burn-heart-rate-lower-limit.js";
import { FatBurnHeartRateUpperLimitImpl } from "./fat-burn-heart-rate-upper-limit.js";
import { FirmwareRevisionStringImpl } from "./firmware-revision-string.js";
import { FirstNameImpl } from "./first-name.js";
import { FiveZoneHeartRateLimitsImpl } from "./five-zone-heart-rate-limits.js";
import { FloorNumberImpl } from "./floor-number.js";
import { GapAppearanceImpl } from "./gap-appearance.js";
import { GapDeviceNameImpl } from "./gap-device-name.js";
import { GapPeripheralPreferredConnectionParametersImpl } from "./gap-peripheral-preferred-connection-parameters.js";
import { GapPeripheralPrivacyFlagImpl } from "./gap-peripheral-privacy-flag.js";
import { GapReconnectionAddressImpl } from "./gap-reconnection-address.js";
import { GattCharacteristicAggregateFormatImpl } from "./gatt-characteristic-aggregate-format.js";
import { GattCharacteristicExtendedPropertiesImpl } from "./gatt-characteristic-extended-properties.js";
import { GattCharacteristicPresentationFormatImpl } from "./gatt-characteristic-presentation-format.js";
import { GattCharacteristicUserDescriptionImpl } from "./gatt-characteristic-user-description.js";
import { GattClientCharacteristicConfigurationImpl } from "./gatt-client-characteristic-configuration.js";
import { GattServerCharacteristicConfigurationImpl } from "./gatt-server-characteristic-configuration.js";
import { GattServiceChangedImpl } from "./gatt-service-changed.js";
import { GenderImpl } from "./gender.js";
import { GlucoseFeatureImpl } from "./glucose-feature.js";
import { GlucoseMeasurementContextImpl } from "./glucose-measurement-context.js";
import { GlucoseMeasurementImpl } from "./glucose-measurement.js";
import { GustFactorImpl } from "./gust-factor.js";
import { HardwareRevisionStringImpl } from "./hardware-revision-string.js";
import { HeartRateControlPointImpl } from "./heart-rate-control-point.js";
import { HeartRateMaxImpl } from "./heart-rate-max.js";
import { HeartRateMeasurementImpl } from "./heart-rate-measurement.js";
import { HeatIndexImpl } from "./heat-index.js";
import { HeightImpl } from "./height.js";
import { HidControlPointImpl } from "./hid-control-point.js";
import { HidInformationImpl } from "./hid-information.js";
import { HipCircumferenceImpl } from "./hip-circumference.js";
import { HttpControlPointImpl } from "./http-control-point.js";
import { HttpEntityBodyImpl } from "./http-entity-body.js";
import { HttpHeadersImpl } from "./http-headers.js";
import { HttpStatusCodeImpl } from "./http-status-code.js";
import { HttpsSecurityImpl } from "./https-security.js";
import { HumidityImpl } from "./humidity.js";
import { IndoorBikeDataImpl } from "./indoor-bike-data.js";
import { IndoorPositioningConfigurationImpl } from "./indoor-positioning-configuration.js";
import { IntermediateCuffPressureImpl } from "./intermediate-cuff-pressure.js";
import { IntermediateTemperatureImpl } from "./intermediate-temperature.js";
import { IrradianceImpl } from "./irradiance.js";
import { LanguageImpl } from "./language.js";
import { LastNameImpl } from "./last-name.js";
import { LatitudeImpl } from "./latitude.js";
import { LnFeatureImpl } from "./ln-feature.js";
import { LocalEastCoordinateImpl } from "./local-east-coordinate.js";
import { LocalNorthCoordinateImpl } from "./local-north-coordinate.js";
import { LocalTimeInformationImpl } from "./local-time-information.js";
import { LocationAndSpeedImpl } from "./location-and-speed.js";
import { LocationNameImpl } from "./location-name.js";
import { LongitudeImpl } from "./longitude.js";
import { MagneticDeclinationImpl } from "./magnetic-declination.js";
import { MagneticFluxDensity2DImpl } from "./Magnetic-flux-density-2D.js";
import { MagneticFluxDensity3DImpl } from "./Magnetic-flux-density-3D.js";
import { ManufacturerNameStringImpl } from "./manufacturer-name-string.js";
import { MaximumRecommendedHeartRateImpl } from "./maximum-recommended-heart-rate.js";
import { MeasurementIntervalImpl } from "./measurement-interval.js";
import { ModelNumberStringImpl } from "./model-number-string.js";
import { NavigationImpl } from "./navigation.js";
import { NewAlertImpl } from "./new-alert.js";
import { NumberOfDigitalsImpl } from "./number-of-digitals.js";
import { ObjectFirstCreatedImpl } from "./object-first-created.js";
import { ObjectIdImpl } from "./object-id.js";
import { ObjectLastModifiedImpl } from "./object-last-modified.js";
import { ObjectNameImpl } from "./object-name.js";
import { ObjectSizeImpl } from "./object-size.js";
import { PlxContinuousMeasurementImpl } from "./plx-continuous-measurement.js";
import { PlxFeaturesImpl } from "./plx-features.js";
import { PlxSpotCheckMeasurementImpl } from "./plx-spot-check-measurement.js";
import { PnpIdImpl } from "./pnp-id.js";
import { PollenConcentrationImpl } from "./pollen-concentration.js";
import { PositionQualityImpl } from "./position-quality.js";
import { PressureImpl } from "./pressure.js";
import { ProtocolModeImpl } from "./protocol-mode.js";
import { RainfallImpl } from "./rainfall.js";
import { ReferenceTimeInformationImpl } from "./reference-time-information.js";
import { ReportMapImpl } from "./report-map.js";
import { ReportReferenceImpl } from "./report-reference.js";
import { ReportImpl } from "./report.js";
import { ResolvablePrivateAddressOnlyImpl } from "./resolvable-private-address-only.js";
import { RestingHeartRateImpl } from "./resting-heart-rate.js";
import { RingerControlPointImpl } from "./ringer-control-point.js";
import { RingerSettingImpl } from "./ringer-setting.js";
import { RowerDataImpl } from "./rower-data.js";
import { RscFeatureImpl } from "./rsc-feature.js";
import { RscMeasurementImpl } from "./rsc-measurement.js";
import { ScanIntervalWindowImpl } from "./scan-interval-window.js";
import { ScanRefreshImpl } from "./scan-refresh.js";
import { SensorLocationImpl } from "./sensor-location.js";
import { SerialNumberStringImpl } from "./serial-number-string.js";
import { SoftwareRevisionStringImpl } from "./software-revision-string.js";
import { SportTypeForAerobicAndAnaerobicThresholdsImpl } from "./sport-type-for-aerobic-and-anaerobic-thresholds.js";
import { StairClimberDataImpl } from "./stair-climber-data.js";
import { StepClimberDataImpl } from "./step-climber-data.js";
import { SupportedHeartRateRangeImpl } from "./supported-heart-rate-range.js";
import { SupportedInclinationRangeImpl } from "./supported-inclination-range.js";
import { SupportedNewAlertCategoryImpl } from "./supported-new-alert-category.js";
import { SupportedPowerRangeImpl } from "./supported-power-range.js";
import { SupportedResistanceLevelRangeImpl } from "./supported-resistance-level-range.js";
import { SupportedSpeedRangeImpl } from "./supported-speed-range.js";
import { SupportedUnreadAlertCategoryImpl } from "./supported-unread-alert-category.js";
import { SystemIdImpl } from "./system-id.js";
import { TemperatureMeasurementImpl } from "./temperature-measurement.js";
import { TemperatureTypeImpl } from "./temperature-type.js";
import { TemperatureImpl } from "./temperature.js";
import { ThreeZoneHeartRateLimitsImpl } from "./three-zone-heart-rate-limits.js";
import { TimeAccuracyImpl } from "./time-accuracy.js";
import { TimeSourceImpl } from "./time-source.js";
import { TimeTriggerSettingImpl } from "./time-trigger-setting.js";
import { TimeUpdateControlPointImpl } from "./time-update-control-point.js";
import { TimeUpdateStateImpl } from "./time-update-state.js";
import { TimeWithDstImpl } from "./time-with-dst.js";
import { TimeZoneImpl } from "./time-zone.js";
import { TreadmillDataImpl } from "./treadmill-data.js";
import { TrueWindDirectionImpl } from "./true-wind-direction.js";
import { TrueWindSpeedImpl } from "./true-wind-speed.js";
import { TwoZoneHeartRateLimitImpl } from "./two-zone-heart-rate-limit.js";
import { TxPowerLevelImpl } from "./tx-power-level.js";
import { UncertaintyImpl } from "./uncertainty.js";
import { UnreadAlertStatusImpl } from "./unread-alert-status.js";
import { UriImpl } from "./uri.js";
import { UserIndexImpl } from "./user-index.js";
import { UvIndexImpl } from "./uv-index.js";
import { ValueTriggerSettingImpl } from "./value-trigger-setting.js";
import { Vo2MaxImpl } from "./vo2-max.js";
import { WaistCircumferenceImpl } from "./waist-circumference.js";
import { WeightMeasurementImpl } from "./weight-measurement.js";
import { WeightScaleFeatureImpl } from "./weight-scale-feature.js";
import { WeightImpl } from "./weight.js";
import { WindChillImpl } from "./wind-chill.js";

export interface BtReaderClass {
	readonly NAME: string;
	readonly TYPE_NAME: string;
	readonly UUID_PREFIX: number;
	readonly name: string;

	fromDataView(dataView: DataView | DataViewReader, indexStart?: number | undefined): object;
}

export const BT_READERS: Readonly<Map<number, BtReaderClass>> = Object.freeze(new Map(([
	AerobicHeartRateLowerLimitImpl,
	AerobicHeartRateUpperLimitImpl,
	AerobicThresholdImpl,
	AgeImpl,
	AggregateImpl,
	AlertCategoryIdImpl,
	AlertCategoryIdBitMaskImpl,
	AlertLevelImpl,
	AlertNotificationControlPointImpl,
	AlertStatusImpl,
	AltitudeImpl,
	AnaerobicHeartRateLowerLimitImpl,
	AnaerobicHeartRateUpperLimitImpl,
	AnaerobicThresholdImpl,
	AnalogImpl,
	ApparentWindDirectionImpl,
	ApparentWindSpeedImpl,
	BarometricPressureTrendImpl,
	BatteryLevelImpl,
	BloodPressureFeatureImpl,
	BloodPressureMeasurementImpl,
	BodyCompositionFeatureImpl,
	BodyCompositionMeasurementImpl,
	BodySensorLocationImpl,
	BootKeyboardInputReportImpl,
	BootKeyboardOutputReportImpl,
	BootMouseInputReportImpl,
	CgmFeatureImpl,
	CrossTrainerDataImpl,
	CscFeatureImpl,
	CscMeasurementImpl,
	CurrentTimeImpl,
	CyclingPowerFeatureImpl,
	CyclingPowerMeasurementImpl,
	CyclingPowerVectorImpl,
	DatabaseChangeIncrementImpl,
	DateOfBirthImpl,
	DateOfThresholdAssessmentImpl,
	DateTimeImpl,
	DayDateTimeImpl,
	DayOfWeekImpl,
	DewPointImpl,
	DigitalImpl,
	DstOffsetImpl,
	ElevationImpl,
	EmailAddressImpl,
	ExactTime256Impl,
	FatBurnHeartRateLowerLimitImpl,
	FatBurnHeartRateUpperLimitImpl,
	FirmwareRevisionStringImpl,
	FirstNameImpl,
	FiveZoneHeartRateLimitsImpl,
	FloorNumberImpl,
	GapAppearanceImpl,
	GapDeviceNameImpl,
	GapPeripheralPreferredConnectionParametersImpl,
	GapPeripheralPrivacyFlagImpl,
	GapReconnectionAddressImpl,
	GattCharacteristicAggregateFormatImpl,
	GattCharacteristicExtendedPropertiesImpl,
	GattCharacteristicPresentationFormatImpl,
	GattCharacteristicUserDescriptionImpl,
	GattClientCharacteristicConfigurationImpl,
	GattServerCharacteristicConfigurationImpl,
	GattServiceChangedImpl,
	GenderImpl,
	GlucoseFeatureImpl,
	GlucoseMeasurementContextImpl,
	GlucoseMeasurementImpl,
	GustFactorImpl,
	HardwareRevisionStringImpl,
	HeartRateControlPointImpl,
	HeartRateMaxImpl,
	HeartRateMeasurementImpl,
	HeatIndexImpl,
	HeightImpl,
	HidControlPointImpl,
	HidInformationImpl,
	HipCircumferenceImpl,
	HttpControlPointImpl,
	HttpEntityBodyImpl,
	HttpHeadersImpl,
	HttpStatusCodeImpl,
	HttpsSecurityImpl,
	HumidityImpl,
	IndoorBikeDataImpl,
	IndoorPositioningConfigurationImpl,
	IntermediateCuffPressureImpl,
	IntermediateTemperatureImpl,
	IrradianceImpl,
	LanguageImpl,
	LastNameImpl,
	LatitudeImpl,
	LnFeatureImpl,
	LocalEastCoordinateImpl,
	LocalNorthCoordinateImpl,
	LocalTimeInformationImpl,
	LocationAndSpeedImpl,
	LocationNameImpl,
	LongitudeImpl,
	MagneticDeclinationImpl,
	MagneticFluxDensity2DImpl,
	MagneticFluxDensity3DImpl,
	ManufacturerNameStringImpl,
	MaximumRecommendedHeartRateImpl,
	MeasurementIntervalImpl,
	ModelNumberStringImpl,
	NavigationImpl,
	NewAlertImpl,
	NumberOfDigitalsImpl,
	ObjectFirstCreatedImpl,
	ObjectIdImpl,
	ObjectLastModifiedImpl,
	ObjectNameImpl,
	ObjectSizeImpl,
	PlxContinuousMeasurementImpl,
	PlxFeaturesImpl,
	PlxSpotCheckMeasurementImpl,
	PnpIdImpl,
	PollenConcentrationImpl,
	PositionQualityImpl,
	PressureImpl,
	ProtocolModeImpl,
	RainfallImpl,
	ReferenceTimeInformationImpl,
	ReportImpl,
	ReportMapImpl,
	ReportReferenceImpl,
	ResolvablePrivateAddressOnlyImpl,
	RestingHeartRateImpl,
	RingerControlPointImpl,
	RingerSettingImpl,
	RowerDataImpl,
	RscFeatureImpl,
	RscMeasurementImpl,
	ScanIntervalWindowImpl,
	ScanRefreshImpl,
	SensorLocationImpl,
	SerialNumberStringImpl,
	SoftwareRevisionStringImpl,
	SportTypeForAerobicAndAnaerobicThresholdsImpl,
	StairClimberDataImpl,
	StepClimberDataImpl,
	SupportedHeartRateRangeImpl,
	SupportedInclinationRangeImpl,
	SupportedNewAlertCategoryImpl,
	SupportedPowerRangeImpl,
	SupportedResistanceLevelRangeImpl,
	SupportedSpeedRangeImpl,
	SupportedUnreadAlertCategoryImpl,
	SystemIdImpl,
	TemperatureImpl,
	TemperatureMeasurementImpl,
	TemperatureTypeImpl,
	ThreeZoneHeartRateLimitsImpl,
	TimeAccuracyImpl,
	TimeSourceImpl,
	TimeTriggerSettingImpl,
	TimeUpdateControlPointImpl,
	TimeUpdateStateImpl,
	TimeWithDstImpl,
	TimeZoneImpl,
	TreadmillDataImpl,
	TrueWindDirectionImpl,
	TrueWindSpeedImpl,
	TwoZoneHeartRateLimitImpl,
	TxPowerLevelImpl,
	UncertaintyImpl,
	UnreadAlertStatusImpl,
	UriImpl,
	UserIndexImpl,
	UvIndexImpl,
	ValueTriggerSettingImpl,
	Vo2MaxImpl,
	WaistCircumferenceImpl,
	WeightImpl,
	WeightMeasurementImpl,
	WeightScaleFeatureImpl,
	WindChillImpl,
] satisfies BtReaderClass[]).map((c) => [ c.UUID_PREFIX, c ])));

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
	const fromId = BT_READERS.get(id);
	if (fromId != null) {
		return fromId;
	}
	const fromOther = Array.from(BT_READERS.values()).filter((r) => r.UUID_PREFIX === id || r.NAME === name || r.TYPE_NAME === name || r.TYPE_NAME.endsWith(name));
	if (fromOther.length > 1) {
		throw new Error(`More than one match: ${ fromOther.map((r) => r.name).join(" ") }`);
	}
	return fromOther.at(0);
};
