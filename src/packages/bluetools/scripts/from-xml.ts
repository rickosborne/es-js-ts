import { catchAnd, deepEquals, formatMarkdownTable, splitFixed } from "@rickosborne/foundation";
import { XMLParser } from "fast-xml-parser";
import { resolve as pathResolve } from "node:path";
import { Project, type PropertyDeclarationStructure, type PropertySignatureStructure, Scope, type StatementStructures, StructureKind, VariableDeclarationKind, type VariableStatementStructure, type WriterFunction } from "ts-morph";
import type { GattCharacteristicName, GattDescriptorName } from "../gatt.js";
import { fetchAndCacheText } from "./fetch-and-cache-text.js";

// import xmlFiles from "./xml-files.json";

const outPath = pathResolve(__dirname, "..");

const characteristicSettings: Partial<Record<GattCharacteristicName, SpecSettings>> = {
	aerobic_heart_rate_lower_limit: {},
	aerobic_heart_rate_upper_limit: {},
	aerobic_threshold: {},
	age: {},
	aggregate: {},
	alert_category_id: {},
	alert_category_id_bit_mask: {},
	alert_level: {},
	alert_notification_control_point: {},
	alert_status: {},
	altitude: {},
	anaerobic_heart_rate_lower_limit: {},
	anaerobic_heart_rate_upper_limit: {},
	anaerobic_threshold: {},
	analog: {},
	apparent_wind_direction: {},
	apparent_wind_speed: {},
	barometric_pressure_trend: {},
	battery_level: {},
	blood_pressure_feature: {},
	blood_pressure_measurement: {},
	body_composition_feature: {},
	body_composition_measurement: {},
	body_sensor_location: {},
	// bond_management_control_point: {},
	// bond_management_feature: {},
	boot_keyboard_input_report: {},
	boot_keyboard_output_report: {},
	boot_mouse_input_report: {},
	cgm_feature: {},
	// cgm_measurement: {},
	// cgm_session_run_time: {},  // unclear condition C1
	// cgm_session_start_time: {},  // unclear condition C1
	// cgm_specific_ops_control_point: {},
	// cgm_status: {}, // unclear condition C1
	cross_trainer_data: {},
	csc_feature: {},
	csc_measurement: {},
	current_time: {},
	// cycling_power_control_point: {},
	cycling_power_feature: {},
	cycling_power_measurement: {
		reqConditions: {
			C1: "wheelRevolutionDataPresent",
			C2: "crankRevolutionDataPresent",
			C3: "extremeForceMagnitudesPresent",
			C4: "extremeTorqueMagnitudesPresent",
			C5: "extremeAnglesPresent",
		},
	},
	cycling_power_vector: {
		reqConditions: {
			C1: "crankRevolutionDataPresent",
			C2: "instantaneousForceMagnitudeArrayPresent",
		},
	},
	database_change_increment: {},
	date_of_birth: {},
	date_of_threshold_assessment: {},
	date_time: {},
	day_date_time: {},
	day_of_week: {},
	descriptor_value_changed: {},
	dew_point: {},
	digital: {},
	dst_offset: {},
	elevation: {},
	email_address: {},
	// es_configuration: {},
	// es_measurement: {},
	// es_trigger_setting: {},
	exact_time_256: {},
	// external_report_reference: {},
	fat_burn_heart_rate_lower_limit: {},
	fat_burn_heart_rate_upper_limit: {},
	firmware_revision_string: {},
	first_name: {},
	fitness_machine_control_point: {},
	fitness_machine_feature: {},
	fitness_machine_status: {},
	five_zone_heart_rate_limits: {
		propNameMap: {
			fiveZoneHeartRateLimitsHardMaximumLimit: "hardMaximumLimit",
			fiveZoneHeartRateLimitsLightModerateLimit: "lightModerateLimit",
			fiveZoneHeartRateLimitsModerateHardLimit: "hardLimit",
			fiveZoneHeartRateLimitsVeryLightLightLimit: "lightLightLimit",
		},
	},
	floor_number: {},
	"gap.appearance": {},
	// "gap.central_address_resolution_support": {},
	"gap.device_name": {},
	"gap.peripheral_preferred_connection_parameters": {},
	"gap.peripheral_privacy_flag": {},
	"gap.reconnection_address": {},
	"gatt.service_changed": {},
	gender: {},
	glucose_feature: {},
	glucose_measurement: {},
	glucose_measurement_context: {},
	gust_factor: {},
	hardware_revision_string: {},
	heart_rate_control_point: {},
	heart_rate_max: {},
	heart_rate_measurement: {
		propNameMap: {
			energyExpended: "energyJ",
			heartRateMeasurementValue: "bpm",
			sensorContactStatus: "sensorContact",
		},
		varArgs: [ "rrInterval" ],
	},
	heat_index: {},
	height: {},
	hid_control_point: {},
	hid_information: {},
	hip_circumference: {},
	http_control_point: {},
	http_entity_body: {},
	http_headers: {},
	http_status_code: {},
	https_security: {},
	humidity: {},
	indoor_bike_data: {},
	indoor_positioning_configuration: {},
	intermediate_cuff_pressure: {},
	intermediate_temperature: {},
	irradiance: {},
	language: {},
	last_name: {},
	latitude: {},
	// ln_control_point: {},
	ln_feature: {},
	local_east_coordinate: {},
	local_north_coordinate: {},
	local_time_information: {},
	location_and_speed: {
		reqConditions: {
			C1: "!!locationPresent",
		},
	},
	location_name: {},
	longitude: {},
	magnetic_declination: {},
	manufacturer_name_string: {},
	maximum_recommended_heart_rate: {},
	measurement_interval: {},
	model_number_string: {},
	navigation: {},
	new_alert: {},
	object_action_control_point: {},
	object_changed: {},
	object_first_created: {},
	object_id: {},
	object_last_modified: {},
	object_list_control_point: {},
	object_list_filter: {},
	object_name: {},
	object_properties: {},
	object_size: {},
	// object_type: {},
	ots_feature: {},
	plx_continuous_measurement: {},
	plx_features: {},
	plx_spot_check_measurement: {},
	pnp_id: {},
	pollen_concentration: {},
	position_quality: {},
	pressure: {},
	protocol_mode: {},
	rainfall: {},
	// record_access_control_point: {},
	reference_time_information: {},
	report: {},
	report_map: {},
	resolvable_private_address_only: {},
	resting_heart_rate: {},
	ringer_control_point: {},
	ringer_setting: {},
	rower_data: {},
	rsc_feature: {
		propNameMap: {
			calibrationProcedureSupported: "supportsCalibration",
			instantaneousStrideLengthMeasurementSupported: "supportsInstantStride",
			multipleSensorLocationsSupported: "supportsMultipleSensors",
			totalDistanceMeasurementSupported: "supportsTotalDistance",
			walkingOrRunningStatusSupported: "supportsWalkRun",
		},
	},
	rsc_measurement: {
		propNameMap: {
			walkingOrRunningStatus: "walkRun",
		},
	},
	// sc_control_point: {},
	scan_interval_window: {},
	scan_refresh: {},
	sensor_location: {},
	serial_number_string: {},
	software_revision_string: {},
	sport_type_for_aerobic_and_anaerobic_thresholds: {},
	stair_climber_data: {},
	step_climber_data: {},
	supported_heart_rate_range: {},
	supported_inclination_range: {},
	supported_new_alert_category: {},
	supported_power_range: {},
	supported_resistance_level_range: {},
	supported_speed_range: {},
	supported_unread_alert_category: {},
	system_id: {},
	tds_control_point: {},
	temperature: {},
	temperature_measurement: {},
	temperature_type: {},
	three_zone_heart_rate_limits: {},
	time_accuracy: {},
	time_source: {},
	time_update_control_point: {},
	time_update_state: {},
	time_with_dst: {},
	time_zone: {},
	training_status: {},
	treadmill_data: {},
	true_wind_direction: {},
	true_wind_speed: {},
	// two_zone_heart_rate_limit: {},
	tx_power_level: {},
	uncertainty: {},
	unread_alert_status: {},
	uri: {},
	user_control_point: {},
	user_index: {},
	uv_index: {},
	vo2_max: {},
	waist_circumference: {},
	weight: {},
	weight_measurement: {},
	weight_scale_feature: {},
	wind_chill: {},
};

const descriptorSettings: Partial<Record<GattDescriptorName, SpecSettings>> = {
	"gatt.characteristic_aggregate_format": {},
	"gatt.characteristic_extended_properties": {},
	// valid_range: {},
	"gatt.characteristic_presentation_format": {},
	"gatt.characteristic_user_description": {},
	"gatt.client_characteristic_configuration": {},
	"gatt.server_characteristic_configuration": {},
	number_of_digitals: {},
	report_reference: {},
	time_trigger_setting: {},
	value_trigger_setting: {},
};

type FieldFormat = "boolean" | "2bit" | "4bit" | "nibble" | "8bit" | "16bit" | "24bit" | "32bit" | "uint8" | "uint8[]" | "uint12" | "uint16" | "uint24" | "uint32" | "uint40" | "uint48" | "uint64" | "uint128" | "sint8" | "sint12" | "sint16" | "sint24" | "sint32" | "sint48" | "sint64" | "sint128" | "float32" | "float64" | "SFLOAT" | "FLOAT" | "duint16" | "utf8s" | "utf16s" | "characteristic" | "struct" | "reg-cert-data-list" | "gatt_uuid" | "variable";

interface ParsedEnumeration {
	key: string;
	requires?: string;
	value: string;
}

type IndexSizeEndStart = {
	index: string;
	size: string;
} | {
	end: string;
	start: string;
};

interface ParsedEnumerations {
	Enumeration?: ParsedEnumeration[] | ParsedEnumeration;
	Reserved?: IndexSizeEndStart;
	ReservedForFutureUse?: IndexSizeEndStart;
}

interface ParsedBit {
	Enumerations?: ParsedEnumerations;
	index: string;
	name?: string | undefined;
	size: string;
}

interface ParsedBitField {
	Bit: ParsedBit[] | ParsedBit;
	ReservedForFutureUse?: IndexSizeEndStart;
}

interface StructuredInformativeText {
	Abstract?: string;
	Examples?: {
		Example: string[] | string;
	};
	Note?: string
	Summary?: string;
	p?: string | string[];
}

type InformativeText = string | string[] | StructuredInformativeText | StructuredInformativeText[];

interface ParsedField {
	BitField?: ParsedBitField;
	Description?: string;
	Enumerations?: ParsedEnumerations;
	Format?: FieldFormat;
	InformativeText?: InformativeText;
	Maximum?: string;
	Minimum?: string;
	Reference?: string;
	Requirement?: string | string[];
	Unit?: string;
	name: string;
}

interface ParsedCharacteristic {
	InformativeText?: InformativeText;
	Note: {
		p?: string | string[];
	} | {
		p?: string | string[];
	}[];
	Value: {
		Field: ParsedField | ParsedField[]
	};
	name: string;
	type: string;
	uuid: string;
}

const xmlUrl = (name: string, type: string): string => {
	return `https://raw.githubusercontent.com/oesmith/gatt-xml/refs/heads/master/org.bluetooth.${ type }.${ name }.xml`;
};

const getSpec = async (url: string): Promise<ParsedCharacteristic> => {
	const text = await fetchAndCacheText(url);
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "",
	});
	const parsed = parser.parse(text) as Record<string, ParsedCharacteristic>;
	const spec = parsed[ "Characteristic" ] ?? parsed[ "Descriptor" ];
	if (spec == null) {
		throw new Error(`Neither Descriptor nor Characteristic: ${ url }`);
	}
	return spec;
};

const lcFirst = (text: string = "") => text.substring(0, 1).toLocaleLowerCase().concat(text.substring(1));
const ucFirst = (text: string = "") => text.substring(0, 1).toLocaleUpperCase().concat(text.substring(1));

interface SpecSettings {
	propNameMap?: Record<string, string>;
	reqConditions?: Record<string, string>;
	varArgs?: string[];
}

const toArray = <T>(value: T | T[] | undefined): T[] => Array.isArray(value) ? value : value == null ? [] : [ value ];

const wrapBlock = (before: WriterFunction, statements: readonly (string | StatementStructures | WriterFunction)[], after?: WriterFunction): string | WriterFunction | (string | StatementStructures | WriterFunction)[] => {
	const p = new Project();
	const source = p.createSourceFile("wrap-block.ts");
	source.addStatements([
		before,
		(writer) => {
			writer.block(() => {
				const body = new Project().createSourceFile("block-body");
				body.addStatements(statements);
				writer.write(body.print());
			});
		},
	]);
	if (after != null) {
		source.addStatements([ before ]);
	}
	return source.getStructure().statements!;
};

const mapDecls = (
	statements: (string | StatementStructures | WriterFunction)[],
	initializerMapper: (initializer: string) => string,
): (string | StatementStructures | WriterFunction)[] => {
	return statements.flatMap((s) => {
		if (typeof s === "string" || typeof s === "function") {
			return s;
		} else if (s.kind === StructureKind.VariableStatement) {
			return s.declarations.map((decl) => {
				if (typeof decl.initializer === "string") {
					return initializerMapper(decl.initializer);
				} else if (typeof decl.initializer === "function") {
					return decl.initializer;
				} else {
					return `// ?`;
				}
			});
		} else {
			return `// ?`;
		}
	});
};

const BITS_BY_FORMAT: Partial<Record<FieldFormat, number>> = {
	"2bit": 2,
	"4bit": 4,
	"8bit": 8,
	"16bit": 16,
	"24bit": 24,
	"32bit": 32,
	"boolean": 1,
	FLOAT: 32,
	nibble: 4,
	SFLOAT: 16,
	sint8: 8,
	sint16: 16,
	sint24: 24,
	sint32: 32,
	uint8: 8,
	uint12: 12,
	uint16: 16,
	uint24: 24,
	uint32: 32,
	uint40: 40,
	uint48: 48,
};

const INITIALIZER_BY_FORMAT: Partial<Record<FieldFormat, string>> = {
	"2bit": "$dvr.uint2()",
	"4bit": "$dvr.nibble()",
	"8bit": "$dvr.uint8()",
	"16bit": "$dvr.uint16()",
	"24bit": "$dvr.uint24()",
	"32bit": "$dvr.uint32()",
	"boolean": "$dvr.bool()",
	FLOAT: "$dvr.float32()",
	nibble: "$dvr.nibble()",
	SFLOAT: "$dvr.float16()",
	sint8: "$dvr.int8()",
	sint16: "$dvr.int16()",
	sint24: "$dvr.int24()",
	sint32: "$dvr.int32()",
	uint8: "$dvr.uint8()",
	uint12: "$dvr.uint12()",
	uint16: "$dvr.uint16()",
	uint24: "$dvr.uint24()",
	uint32: "$dvr.uint32()",
	uint40: "$dvr.uint40()",
	uint48: "$dvr.uint48()",
	utf8s: "$dvr.utf8s()",
	variable: "undefined",
};

const getInformativeText = (field: { InformativeText?: InformativeText | InformativeText[] }): string[] => {
	const texts: string[] = [];
	const recurse = (info: InformativeText | InformativeText[] | undefined): void => {
		if (info == null) return;
		if (typeof info === "string") {
			texts.push(info);
		} else if (Array.isArray(info)) {
			info.forEach((i) => recurse(i));
		} else {
			const { p, Abstract: abs, Examples: ex, Note: note, Summary: summary } = info;
			recurse(p);
			recurse(abs);
			toArray(ex?.Example).forEach((e) => recurse(e));
			recurse(note);
			recurse(summary);
		}
	};
	recurse(field.InformativeText);
	return texts
		.filter((t) => t != null)
		.map((t) => t.replace(/\s+/g, " ").trim())
		.filter((t) => t !== "");
};

const declForField = (field: ParsedField, settings: SpecSettings): VariableStatementStructure => {
	const propName = propNameFromField(field, settings);
	let initializer: string | undefined;
	if (field.Format == null) {
		if (field.Reference == null) {
			throw new Error(`No format for field: ${ field.name }`);
		}
		const refNames = namesFromReference(field.Reference.trim());
		initializer = `${ refNames.titleCase }Impl.fromDataView($dvr)`;
	} else {
		initializer = INITIALIZER_BY_FORMAT[ field.Format ]!;
	}
	if (initializer == null) {
		throw new Error(`No initializer for field: ${ field.name } ${ field.Format }`);
	}
	return {
		declarationKind: VariableDeclarationKind.Const,
		declarations: [ {
			initializer,
			kind: StructureKind.VariableDeclaration,
			name: propName,
		} ],
		kind: StructureKind.VariableStatement,
	};
};

const propNameFromField = (field: string | { name: string }, settings: SpecSettings): string => {
	const name = typeof field === "string" ? field : field.name;
	const fromName = name.replace(/\s+\(uint\d+\)/g, "")
		.split(/\W+/)
		.map((word, index) => index === 0 ? word.toLocaleLowerCase() : ucFirst(word))
		.join("")
		.replace(/Bits$/, "");
	return settings.propNameMap?.[ fromName ] ?? fromName;
};

const fieldSiblings = (field: ParsedField, char: ParsedCharacteristic, settings: SpecSettings): ParsedField[] => {
	const fieldName = propNameFromField(field, settings);
	const allFields: ParsedField[] = toArray(char.Value.Field);
	return allFields.filter((f) => f.name === field.name || propNameFromField(f, settings) === fieldName);
};

const isOptional = (field: ParsedField, char: ParsedCharacteristic, settings: SpecSettings): boolean => {
	const reqNames = toArray(field.Requirement);
	if (reqNames.includes("Optional")) {
		return true;
	}
	if (reqNames.includes("Mandatory")) {
		return false;
	}
	if (field.BitField?.Bit != null) {
		return false;
	}
	const allFields: ParsedField[] = toArray(char.Value.Field);
	const siblings = fieldSiblings(field, char, settings);
	if (siblings.length < 2) {
		return true;
	}
	const requirements = Array.from(new Set(siblings.flatMap((f) => f.Requirement).filter((s) => s != null))).sort();
	// Do all the requirements cover a single field?
	for (const f of allFields) {
		if (f.BitField == null) continue;
		const bits = toArray(f.BitField.Bit);
		for (const bit of bits) {
			const enumerations = Array.from(new Set(toArray(bit.Enumerations?.Enumeration).flatMap((e) => e.requires).filter((r) => r != null))).sort();
			if (deepEquals(requirements, enumerations)) {
				return false;
			}
		}
	}
	return true;
};

interface Names {
	fileName: string;
	nameWords: string[];
	propCase: string;
	titleCase: string;
	titleWords: string[];
}

const namesFromSnake = (snake: string): Names => {
	const nameWords = snake.split(/[._]/g);
	const titleWords = nameWords.map(ucFirst);
	const titleCase = titleWords.join("");
	const fileName = nameWords.join("-").concat(".ts");
	const propCase = nameWords.map((w, i) => i === 0 ? lcFirst(w) : ucFirst(w)).join("");
	return { fileName, nameWords, propCase, titleCase, titleWords };
};

const namesFromReference = (ref: string): Names => {
	if (!ref.startsWith("org.bluetooth.characteristic.")) {
		throw new Error(`Expected characteristic ref: ${ ref }`);
	}
	return namesFromSnake(ref.replace("org.bluetooth.characteristic.", ""));
};

interface ParsedFieldType {
	basePropType: string;
	isVarArg: boolean;
	optional: boolean;
	propInitializer: string | undefined;
	propType: string;
}

const TYPE_BY_FORMAT: Partial<Record<FieldFormat, string>> = {
	"boolean": "boolean",
	utf8s: "string",
};

const propTypeFromField = (propName: string, field: ParsedField, spec: ParsedCharacteristic, settings: SpecSettings): ParsedFieldType => {
	const isVarArg = settings.varArgs?.includes(propName) ?? false;
	const optional = isOptional(field, spec, settings);
	let basePropType: string;
	let propInitializer: string | undefined = optional ? "undefined" : undefined;
	if (field.Reference != null) {
		const refNames = namesFromReference(field.Reference.trim());
		basePropType = refNames.titleCase;
	} else if (field.Format != null) {
		basePropType = TYPE_BY_FORMAT[ field.Format ] ?? "number";
	} else {
		basePropType = "number";
	}
	if (isVarArg) {
		basePropType = basePropType.concat("[]");
		propInitializer ??= "[]";
	} else if (!optional) {
		if (basePropType === "number") propInitializer ??= "0";
		else if (basePropType === "boolean") propInitializer ??= "false";
	}
	const propType = optional ? `${ basePropType } | undefined` : basePropType;
	return { basePropType, isVarArg, optional, propInitializer, propType };
};

const toIndexSize = (value: IndexSizeEndStart): { end: number; index: number; size: number; start: number; } => {
	let index = "index" in value ? Number.parseInt(value.index) : undefined;
	let size = "size" in value ? Number.parseInt(value.size) : undefined;
	let end = "end" in value ? Number.parseInt(value.end) : undefined;
	let start = "start" in value ? Number.parseInt(value.start) : undefined;
	index ??= start ?? 0;
	start ??= index;
	size ??= end != null ? end - start + 1 : 0;
	end ??= index + size - 1;
	return { end, index, size, start };
};

const htmlEscape = (text: string): string => {
	return text.replace(/&/g, "&amp;")
		.replace(/</g, "&gt;")
		.replace(/>/g, "&gt;")
		.replace(/\s+/g, " ");
};

interface BitForTable {
	index: string;
	name: string;
	req: string;
	size: string;
}

const handleEnumerations = (
	enums: ParsedEnumeration[],
	propName: string,
	fieldName: string,
	field: ParsedField,
	fieldOptional: boolean,
	bit: ParsedBit,
	onReqCondition: (key: string, block: () => void) => void,
	addReqCondition: (name: string, value: string) => void,
	addProp: (sig: PropertySignatureStructure, decl: PropertyDeclarationStructure) => void,
	addFromFnStatement: (statement: StatementStructures) => void,
	addVarDocs: (name: string, docs: string[]) => void,
): void => {
	const requires = Array.from(new Set(enums.map((e) => e.requires).filter((r) => r != null))).sort();
	// const bitName = propNameFromField(fieldName, settings);
	const index = Number.parseInt(bit.index, 10);
	const size = Number.parseInt(bit.size, 10);
	const isFlag = size === 1 && requires.length > 0;
	const width = field.Format == null ? undefined : BITS_BY_FORMAT[ field.Format ];
	if (width == null) {
		throw new Error(`Could not find width for ${propName} ${fieldName}`);
	}
	let binary = "0".repeat(width).concat("1".repeat(size), "0".repeat(Math.max(0, index)));
	binary = splitFixed(binary.substring(binary.length - width), 4).join("_");
	const stmtDoc: string[] = [];
	stmtDoc.push("", formatMarkdownTable(enums, {
		columnNames: {
			key: "value",
			value: "description",
			requires: "req",
		},
		columnOrder: [ "key", "requires", "value" ],
	}).trim());
	if (requires.length > 0) {
		stmtDoc.push(`<p>Requirements: ${ requires.join(", ") }</p>`);
	} else {
		const propSig: PropertySignatureStructure = {
			kind: StructureKind.PropertySignature,
			name: fieldName,
			type: "number",
			docs: stmtDoc.filter((t) => t != null && t !== ""),
		};
		const propDecl: PropertyDeclarationStructure = {
			isReadonly: true,
			kind: StructureKind.Property,
			name: fieldName,
			scope: Scope.Public,
			type: "number",
		};
		onReqCondition(fieldName, () => {
			addProp(propSig, propDecl);
		});
	}
	let initializerExpr = `${ fieldOptional ? `(${ propName } ?? 0)` : propName } & 0b${ binary }`;
	let fieldAlias = fieldName;
	if (index > 0) {
		initializerExpr = `(${ initializerExpr }) >> ${ index }`;
	} else if (index < 0) {
		addVarDocs(propName, stmtDoc);
		fieldAlias = propName;
	}
	if (isFlag) {
		initializerExpr = `!!(${ initializerExpr })`;
	}
	const fromFnStatement: StatementStructures = {
		declarationKind: VariableDeclarationKind.Const,
		declarations: [ {
			name: fieldName,
			initializer: initializerExpr,
			kind: StructureKind.VariableDeclaration,
		} ],
		docs: [ {
			description: stmtDoc.join("\n"),
			kind: StructureKind.JSDoc,
		} ],
		kind: StructureKind.VariableStatement,
	};
	let alreadyAdded = false;
	const deferredAdd = () => {
		if (!alreadyAdded && index >= 0) {
			alreadyAdded = true;
			addFromFnStatement(fromFnStatement);
		}
	};
	onReqCondition(fieldName, deferredAdd);
	for (const { key: enumKey, requires: enumReq } of enums) {
		if (enumReq != null) {
			const value = Number.parseInt(enumKey);
			addReqCondition(enumReq, isFlag ? `${ value === 0 ? "!" : "" }${ fieldAlias }` : `${ fieldAlias } === ${ value }`);
			onReqCondition(enumReq, deferredAdd);
		}
	}
};

async function convertSpec(specName: GattCharacteristicName | GattDescriptorName, url: string, settings: SpecSettings): Promise<void> {
	const project = new Project();
	const spec = await getSpec(url);
	const { fileName, propCase, titleCase, titleWords } = namesFromSnake(specName);
	console.log(`${ specName } => ${ fileName }`);
	if (spec?.Value?.Field == null) return;
	const filePath = pathResolve(outPath, fileName);
	const statements: StatementStructures[] = [];
	const source = project.createSourceFile(filePath, { statements }, { overwrite: true });
	source.addStatements([
		"// This file is autogenerated.",
		"// Do not edit it by hand, as changes will be lost.",
		`// Upstream source: ${ url }`,
	]);
	source.addImportDeclaration({
		namedImports: [ {
			kind: StructureKind.ImportSpecifier,
			name: "DataViewReader",
			isTypeOnly: true,
		}, {
			kind: StructureKind.ImportSpecifier,
			name: "dataViewReader",
		} ],
		kind: StructureKind.ImportDeclaration,
		moduleSpecifier: "./data-view-reader.js",
	});
	const references = toArray(spec.Value.Field)
		.flatMap((f) => f.Reference?.trim())
		.filter((r): r is string => r != null && r !== "");
	for (const refName of references) {
		const refNames = namesFromReference(refName);
		source.addImportDeclaration({
			namedImports: [ {
				kind: StructureKind.ImportSpecifier,
				name: refNames.titleCase,
				isTypeOnly: true,
			}, {
				kind: StructureKind.ImportSpecifier,
				name: refNames.titleCase.concat("Impl"),
			} ],
			kind: StructureKind.ImportDeclaration,
			moduleSpecifier: `./${ refNames.fileName.replace(/\.ts$/, ".js") }`,
		});
	}
	const int = source.addInterface({
		name: titleCase,
		isExported: true,
	});
	const typeInformative = getInformativeText(spec);
	if (typeInformative.length > 0) {
		int.addJsDoc(typeInformative.map((line) => `<p>${ htmlEscape(line) }</p>`).join("\n"));
	}
	const impl = source.addClass({
		"implements": [ titleCase ],
		name: titleCase.concat("Impl"),
		isExported: true,
	});
	const note = toArray(spec.Note).flatMap((n) => toArray(n.p)).join("\n");
	const intDoc = impl.addJsDoc({
		description: note.replace(/\s+/g, " "),
	});
	intDoc.addTag({ tagName: "see", text: `{@link ${ url } | ${ titleWords.join(" ") }}` });
	impl.addProperty({
		isStatic: true,
		isReadonly: true,
		name: "UUID_PREFIX",
		scope: Scope.Public,
		initializer: `0x${ spec.uuid.toLocaleLowerCase() }`,
	});
	impl.addProperty({
		isStatic: true,
		isReadonly: true,
		name: "TYPE_NAME",
		scope: Scope.Public,
		initializer: JSON.stringify(spec.type),
	});
	impl.addProperty({
		isStatic: true,
		isReadonly: true,
		name: "NAME",
		scope: Scope.Public,
		initializer: JSON.stringify(spec.name),
	});
	const fromDataView = impl.addMethod({
		docs: [ `Parse from a DataView into {@link ${ titleCase }}.` ],
		isStatic: true,
		name: "fromDataView",
		parameters: [ {
			name: "dataView",
			type: "DataView | DataViewReader",
		}, {
			hasQuestionToken: true,
			name: "indexStart",
			type: "number | undefined",
		} ],
		returnType: titleCase.concat("Impl"),
		scope: Scope.Public,
	});
	fromDataView.addStatements(`return new ${ titleCase }Impl(${ propCase }FromDataView(dataView, indexStart));`);
	const propNames = new Map<string, ParsedField>();
	const propDecls: PropertyDeclarationStructure[] = [];
	const propSigs: PropertySignatureStructure[] = [];
	const addProp = (sig: PropertySignatureStructure, decl: PropertyDeclarationStructure): void => {
		propSigs.push(sig);
		propDecls.push(decl);
	};
	const fromFnStatements: (StatementStructures | string | WriterFunction)[] = [ {
		declarationKind: VariableDeclarationKind.Const,
		declarations: [ {
			initializer: "dataViewReader(dataView, indexStart)",
			kind: StructureKind.VariableDeclaration,
			name: "$dvr",
			type: "DataViewReader",
		} ],
		kind: StructureKind.VariableStatement,
	} ];
	const addFromFnStatement = (statement: StatementStructures): void => {
		fromFnStatements.push(statement);
	};
	const reqConditions: Record<string, string> = settings.reqConditions ?? {};
	const addReqCondition = (key: string, value: string): void => {
		reqConditions[ key ] = value;
	};
	const onReqConditions = new Map<string, (() => void)[]>();
	const onReqCondition = (key: string, block: () => void): void => {
		let list = onReqConditions.get(key);
		if (list == null) {
			list = [];
			onReqConditions.set(key, list);
		}
		list.push(block);
	};
	const varDocsMap = new Map<string, string[]>();
	const addVarDocs = (name: string, docs: string[]): void => {
		const existing = fromFnStatements.find((s): s is VariableStatementStructure => typeof s !== "string" && typeof s !== "function" && s.kind === StructureKind.VariableStatement && s.declarations.some((d) => d.name === name));
		if (existing != null) {
			if (existing.docs != null) {
				existing.docs.push(...docs);
			} else {
				existing.docs = docs;
			}
		} else {
			let list = varDocsMap.get(name);
			if (list == null) {
				list = [];
				varDocsMap.set(name, list);
			}
			list.push(...docs);
		}
	};
	for (const field of toArray(spec.Value.Field)) {
		// console.log(field);
		const propName = propNameFromField(field, settings);
		const { isVarArg, optional, propInitializer, propType } = propTypeFromField(propName, field, spec, settings);
		const sharedWith = propNames.get(propName);
		propNames.set(propName, field);
		const fieldRequires = toArray(field.Requirement);
		const reqIds = fieldRequires.filter((r) => r !== "Mandatory" && r !== "Optional");
		const siblings = fieldSiblings(field, spec, settings);
		let readStatements: (string | StatementStructures | WriterFunction)[] = [];
		const propDecl = declForField(field, settings);
		const varDocs = varDocsMap.get(propName);
		if (varDocs != null) {
			if (Array.isArray(propDecl.docs)) {
				propDecl.docs.push(...varDocs);
			} else {
				propDecl.docs = varDocs;
			}
		}
		readStatements.push(propDecl);
		if (isVarArg) {
			readStatements = toArray(wrapBlock(
				(writer) => writer.write(`while ($dvr.bytesRemain > 0)`),
				mapDecls(readStatements, (v) => `${ propName }.push(${ v })`),
			));
			if (optional) {
				readStatements.unshift(`${ propName } = [];`);
			}
		}
		if (reqIds.length === 0) {
			fromFnStatements.push(...readStatements);
		} else if (sharedWith == null) {
			fromFnStatements.push({
				declarationKind: VariableDeclarationKind.Let,
				declarations: [ {
					kind: StructureKind.VariableDeclaration,
					...(propInitializer == null ? {} : { initializer: propInitializer }),
					name: propName,
					type: propType,
				} ],
				...(varDocs == null ? {} : { docs: varDocs }),
				kind: StructureKind.VariableStatement,
			});
			const f = new Project().createSourceFile("siblings.ts");
			for (let siblingIndex = 0; siblingIndex < siblings.length; siblingIndex++) {
				const sibling = siblings[ siblingIndex ]!;
				const siblingCondition = toArray(sibling.Requirement)
					.map((r) => {
						onReqConditions.get(r)?.forEach((b) => b());
						const reqCondition = reqConditions[ r ];
						if (reqCondition == null) {
							console.warn(`🤬 Need to materialize condition ${ r }`);
							return r;
						}
						onReqConditions.get(reqCondition)?.forEach((b) => b());
						return reqCondition;
					})
					.join(" && ");
				let lead: string;
				if (siblingIndex === 0) {
					lead = `if (${ siblingCondition })`;
				} else if (siblingIndex < siblings.length - 1) {
					lead = `else if (${ siblingCondition })`;
				} else {
					lead = "else";
				}
				f.addStatements([
					(writer) => {
						writer.write(lead).block(() => {
							const g = new Project().createSourceFile("sibling-inner.ts");
							if (sibling === field) {
								g.addStatements(mapDecls(readStatements, (v) => `${ propName } = ${ v }`));
							} else {
								g.addStatements(mapDecls([ declForField(sibling, settings) ], (v) => `${ propName } = ${ v }`));
							}
							writer.write(g.print()).newLineIfLastNot();
						});
					},
				]);
			}
			// const statements = ifStatement(reqIds.join(" && "), mapDecls(readStatements, (v) => `${propName} = ${v}`));
			const stmts = f.getStructure().statements;
			if (statements == null) {
				throw new Error(`No if statements found: ${ propName }`);
			} else if (Array.isArray(stmts)) {
				fromFnStatements.push(...stmts);
			} else {
				fromFnStatements.push(stmts!);
			}
		}
		let docDesc: string[] = [];
		if (field.Description != null) {
			docDesc.push(`<p>${ htmlEscape(field.Description) }</p>`);
		}
		if (field.Format != null) {
			docDesc.push(`<p>Format: \`${ field.Format }\`</p>`);
		}
		if (field.Unit != null) {
			docDesc.push(`<p>Unit: \`${ field.Unit }\`</p>`);
		}
		const informative = getInformativeText(field);
		if (informative.length > 0) {
			docDesc.push(informative.map((t) => `<p>${ htmlEscape(t) }</p>`).join("\n"));
		}
		if (field.Minimum != null) {
			docDesc.push(`<p>Minimum: ${ field.Minimum }</p>`);
		}
		if (field.Maximum != null) {
			docDesc.push(`<p>Maximum: ${ field.Maximum }</p>`);
		}
		let enumerations: ParsedEnumeration[] = [];
		if (field.Enumerations != null) {
			enumerations = toArray(field.Enumerations.Enumeration);
			const enumsTable = enumerations.map((f) => ({ desc: f.value ?? "(no description)", key: Number.parseInt(f.key), req: f.requires }));
			if (enumsTable.length > 0) {
				const table = formatMarkdownTable(enumsTable, {
					columnOrder: [ "key", "req", "desc" ],
					columnNames: {
						desc: "Description",
						key: "Key",
						req: "Req.",
					},
				});
				docDesc.push(table);
			}
			if (field.Enumerations.Reserved != null) {
				const indexSize = toIndexSize(field.Enumerations.Reserved);
				docDesc.push(`<p>Reserved: ${ indexSize.start }${ indexSize.end === indexSize.start ? "" : ` to ${ indexSize.end }` }</p>`);
			}
			if (field.Enumerations.ReservedForFutureUse != null) {
				const indexSize = toIndexSize(field.Enumerations.ReservedForFutureUse);
				docDesc.push(`<p>Reserved for future use: ${ indexSize.start }${ indexSize.end === indexSize.start ? "" : ` to ${ indexSize.end }` }</p>`);
			}
		}
		if (field.BitField != null) {
			const bits: BitForTable[] = [];
			for (const bit of toArray(field.BitField.Bit)) {
				const enums = toArray(bit.Enumerations?.Enumeration);
				const bitForTable: BitForTable = {
					index: bit.index,
					name: bit.name ?? `bit${ bit.index }`,
					req: enums.map((e) => e.requires).filter((r) => r != null).sort().join(", "),
					size: bit.size,
				};
				bits.push(bitForTable);
				const bitName = propNameFromField(bitForTable.name, settings);
				handleEnumerations(enums, propName, bitName, field, optional, bit, (_k, b) => b(), addReqCondition, addProp, addFromFnStatement, addVarDocs);
			}
			if (field.BitField.ReservedForFutureUse != null) {
				const rfu = field.BitField.ReservedForFutureUse;
				const indexSize = toIndexSize(rfu);
				bits.push({ index: String(indexSize.index), size: String(indexSize.size), req: "", name: "Reserved for future use" });
			}
			const table = formatMarkdownTable(bits, {
				columnOrder: [ "index", "size", "req", "name" ],
			});
			docDesc.push("", `Bit field:`, "", table);
		} else if (enumerations.length > 0) {
			const fieldSize = field.Format == null ? undefined : BITS_BY_FORMAT[ field.Format ];
			if (fieldSize == null) {
				throw new Error(`Enumerations on a field with unknown size: ${ propName } ${ field.Format }`);
			}
			handleEnumerations(enumerations, propName, propName.concat("Enum"), field, optional, { name: propName.concat("Enum"), index: "-1", Enumerations: { Enumeration: enumerations }, size: String(fieldSize) }, onReqCondition, addReqCondition, () => void (0), addFromFnStatement, addVarDocs);
		}
		if (sharedWith == null) {
			const sig: PropertySignatureStructure = {
				docs: docDesc.length > 0 ? [ {
					kind: StructureKind.JSDoc,
					description: docDesc.join("\n"),
				} ] : [],
				kind: StructureKind.PropertySignature,
				name: propName,
				hasQuestionToken: optional,
				type: propType,
			};
			const decl: PropertyDeclarationStructure = {
				isReadonly: true,
				hasQuestionToken: optional,
				kind: StructureKind.Property,
				name: propName,
				scope: Scope.Public,
				type: propType,
			};
			addProp(sig, decl);
		}
	}
	propDecls.sort((a, b) => a.name.localeCompare(b.name));
	propSigs.sort((a, b) => a.name.localeCompare(b.name));
	int.addProperties(propSigs);
	impl.addProperties(propDecls);
	const ctor = impl.addConstructor({
		parameters: [ {
			name: propCase,
			type: titleCase,
		} ],
		scope: Scope.Public,
	});
	ctor.addStatements(propDecls.map((prop) => {
		return `this.${ prop.name } = ${ propCase }.${ prop.name };`;
	}));
	fromFnStatements.push(`return { ${ propDecls.map((d) => d.name).join(", ") } };`);
	source.addFunction({
		docs: [ `Parse from a DataView into {@link ${ titleCase }}.` ],
		isExported: true,
		name: propCase.concat("FromDataView"),
		parameters: [ {
			name: "dataView",
			type: "DataView | DataViewReader",
		}, {
			initializer: "0",
			name: "indexStart",
			type: "number",
		} ],
		returnType: titleCase,
		statements: fromFnStatements,
	});
	await project.save();
}

// interface XmlFileLink {
// 	download_url: string;
// 	name: string;
// }

const getSpecs = async (): Promise<void> => {
	const done = new Set<string>();
	for (const [ specName, settings ] of Object.entries(characteristicSettings) as [ specName: GattCharacteristicName, settings: SpecSettings ][]) {
		const url = xmlUrl(specName, "characteristic");
		await convertSpec(specName, url, settings);
		done.add(specName);
	}
	for (const [ specName, settings ] of Object.entries(descriptorSettings) as [ specName: GattDescriptorName, settings: SpecSettings ][]) {
		const url = xmlUrl(specName, "descriptor");
		await convertSpec(specName, url, settings);
		done.add(specName);
	}
	// https://api.github.com/repos/oesmith/gatt-xml/contents/
	// for (const xmlFile of xmlFiles as XmlFileLink[]) {
	// 	const specMatch = /^org\.bluetooth\.([^.]+)\.(.+?)\.xml$/.exec(xmlFile.name);
	// 	if (specMatch == null) continue;
	// 	const [ , specType, specName ] = specMatch as unknown as [ string, string, string ];
	// 	if (specType !== "characteristic" && specType !== "descriptor") continue;
	// 	if (done.has(specName)) continue;
	// 	console.log(`${ JSON.stringify(specName) }: {},`);
	// }
};

getSpecs()
	.catch(catchAnd({ rethrow: true }));
