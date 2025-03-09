import { catchAnd, deepEquals, formatMarkdownTable, splitFixed } from "@rickosborne/foundation";
import { XMLParser } from "fast-xml-parser";
import { resolve as pathResolve } from "node:path";
import { Project, type PropertyDeclarationStructure, type PropertySignatureStructure, Scope, type StatementStructures, StructureKind, VariableDeclarationKind, type VariableStatementStructure, type WriterFunction } from "ts-morph";
import type { GattCharacteristicName, GattDescriptorName } from "../assigned.js";
import { fetchAndCacheText } from "./fetch-and-cache-text.js";

const outPath = pathResolve(__dirname, "..");

const characteristicSettings: Partial<Record<GattCharacteristicName, SpecSettings>> = {
	battery_level: {},
	cross_trainer_data: {},
	csc_feature: {},
	csc_measurement: {},
	current_time: {},
	day_date_time: {},
	day_of_week: {},
	date_time: {},
	dst_offset: {},
	elevation: {},
	exact_time_256: {},
	firmware_revision_string: {},
	five_zone_heart_rate_limits: {
		propNameMap: {
			fiveZoneHeartRateLimitsHardMaximumLimit: "hardMaximumLimit",
			fiveZoneHeartRateLimitsLightModerateLimit: "lightModerateLimit",
			fiveZoneHeartRateLimitsModerateHardLimit: "hardLimit",
			fiveZoneHeartRateLimitsVeryLightLightLimit: "lightLightLimit",
		},
	},
	glucose_feature: {},
	glucose_measurement: {},
	glucose_measurement_context: {},
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
	indoor_bike_data: {},
	language: {},
	latitude: {},
	local_time_information: {},
	location_and_speed: {
		reqConditions: {
			C1: "!!locationPresent",
		},
	},
	location_name: {},
	longitude: {},
	manufacturer_name_string: {},
	maximum_recommended_heart_rate: {},
	measurement_interval: {},
	model_number_string: {},
	navigation: {},
	plx_continuous_measurement: {},
	plx_features: {},
	plx_spot_check_measurement: {},
	reference_time_information: {},
	resting_heart_rate: {},
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
	sensor_location: {},
	serial_number_string: {},
	software_revision_string: {},
	supported_heart_rate_range: {},
	supported_inclination_range: {},
	supported_speed_range: {},
	system_id: {},
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
	treadmill_data: {},
	two_zone_heart_rate_limit: {},
	vo2_max: {},
};

const descriptorSettings: Partial<Record<GattDescriptorName, SpecSettings>> = {
	"gatt.characteristic_presentation_format": {},
	number_of_digitals: {},
	// valid_range: {},
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

const INITIALIZER_BY_FORMAT: Partial<Record<FieldFormat, string>> = {
	"8bit": "$dvr.uint8()",
	"16bit": "$dvr.uint16()",
	"24bit": "$dvr.uint24()",
	FLOAT: "$dvr.float()",
	nibble: "$dvr.nibble()",
	SFLOAT: "$dvr.sFloat()",
	sint8: "$dvr.int8()",
	sint16: "$dvr.int16()",
	sint24: "$dvr.int24()",
	sint32: "$dvr.int32()",
	uint8: "$dvr.uint8()",
	uint16: "$dvr.uint16()",
	uint24: "$dvr.uint24()",
	uint32: "$dvr.uint32()",
	uint40: "$dvr.uint40()",
	utf8s: "$dvr.utf8s()",
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

async function convertSpec(specName: GattCharacteristicName | GattDescriptorName, url: string, settings: SpecSettings): Promise<void> {
	const project = new Project();
	const spec = await getSpec(url);
	const { fileName, propCase, titleCase, titleWords } = namesFromSnake(specName);
	console.log(`${ specName } => ${ fileName }`);
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
		docs: [ `Parse from a DataView into {@link ${titleCase}}.` ],
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
	const reqConditions: Record<string, string> = settings.reqConditions ?? {};
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
				kind: StructureKind.VariableStatement,
			});
			const f = new Project().createSourceFile("siblings.ts");
			for (let siblingIndex = 0; siblingIndex < siblings.length; siblingIndex++) {
				const sibling = siblings[ siblingIndex ]!;
				const siblingCondition = toArray(sibling.Requirement)
					.map((r) => reqConditions[ r ] ?? r)
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
			const statements = f.getStructure().statements;
			if (statements == null) {
				throw new Error(`No if statements found: ${ propName }`);
			} else if (Array.isArray(statements)) {
				fromFnStatements.push(...statements);
			} else {
				fromFnStatements.push(statements);
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
		if (field.Enumerations != null) {
			const enumerations = toArray(field.Enumerations.Enumeration).map((f) => ({ desc: f.value ?? "(no description)", key: Number.parseInt(f.key), req: f.requires }));
			if (enumerations.length > 0) {
				const table = formatMarkdownTable(enumerations, {
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
			const bits: { index: string; name: string; req: string; size: string; }[] = [];
			for (const bit of toArray(field.BitField.Bit)) {
				const enums = toArray(bit.Enumerations?.Enumeration);
				const requires = enums.map((e) => e.requires).filter((r) => r != null).sort();
				bits.push({
					index: bit.index,
					name: bit.name ?? `bit${ bit.index }`,
					req: requires.join(", "),
					size: bit.size,
				});
				const bitName = propNameFromField(bit.name ?? `bit${ bit.index }`, settings);
				const index = Number.parseInt(bit.index, 10);
				const size = Number.parseInt(bit.size, 10);
				const isFlag = size === 1 && requires.length > 0;
				const width = field.Format === "8bit" ? 8 : field.Format === "16bit" ? 16 : 32;
				let binary = "0".repeat(width).concat("1".repeat(size), "0".repeat(index));
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
					propSigs.push({
						kind: StructureKind.PropertySignature,
						name: bitName,
						type: "number",
						docs: stmtDoc.filter((t) => t != null && t !== ""),
					});
					propDecls.push({
						isReadonly: true,
						kind: StructureKind.Property,
						name: bitName,
						scope: Scope.Public,
						type: "number",
					});
				}
				let initializerExpr = `${ propName } & 0b${ binary }`;
				if (index > 0) {
					initializerExpr = `(${ initializerExpr }) >> ${ index }`;
				}
				if (isFlag) {
					initializerExpr = `!!(${ initializerExpr })`;
				}
				fromFnStatements.push({
					declarationKind: VariableDeclarationKind.Const,
					declarations: [ {
						name: bitName,
						initializer: initializerExpr,
						kind: StructureKind.VariableDeclaration,
					} ],
					docs: [ {
						description: stmtDoc.join("\n"),
						kind: StructureKind.JSDoc,
					} ],
					kind: StructureKind.VariableStatement,
				});
				for (const { key: enumKey, requires: enumReq } of enums) {
					if (enumReq != null) {
						const value = Number.parseInt(enumKey);
						reqConditions[ enumReq ] = isFlag ? `${ value === 0 ? "!" : "" }${ bitName }` : `${ bitName } === ${ value }`;
					}
				}
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
		}
		if (sharedWith == null) {
			propSigs.push({
				docs: docDesc.length > 0 ? [ {
					kind: StructureKind.JSDoc,
					description: docDesc.join("\n"),
				} ] : [],
				kind: StructureKind.PropertySignature,
				name: propName,
				hasQuestionToken: optional,
				type: propType,
			});
			propDecls.push({
				isReadonly: true,
				hasQuestionToken: optional,
				kind: StructureKind.Property,
				name: propName,
				scope: Scope.Public,
				type: propType,
			});
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
		docs: [ `Parse from a DataView into {@link ${titleCase}}.` ],
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

const getSpecs = async (): Promise<void> => {
	for await (const [ specName, settings ] of Object.entries(characteristicSettings) as [ specName: GattCharacteristicName, settings: SpecSettings ][]) {
		const url = xmlUrl(specName, "characteristic");
		await convertSpec(specName, url, settings);
	}
	for await (const [ specName, settings ] of Object.entries(descriptorSettings) as [ specName: GattDescriptorName, settings: SpecSettings ][]) {
		const url = xmlUrl(specName, "descriptor");
		await convertSpec(specName, url, settings);
	}
};

getSpecs()
	.catch(catchAnd({ rethrow: true }));
