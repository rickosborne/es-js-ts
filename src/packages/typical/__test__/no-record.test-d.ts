import { describe, expect, it } from "tstyche";
import type { NoRecord } from "../no-record.js";

type AnyRecord = {
	readonly id: string;
	[ key: string | number | symbol ]: string;
};

type StringRecord = {
	readonly id: string;
	[ key: string ]: string;
};

type NumberRecord = {
	readonly id: string;
	[ key: number ]: string;
}

type SymbolRecord = {
	readonly id: string;
	[ key: symbol ]: string;
}

type Specifics = {
	readonly id: string;
};

describe("NoRecord", () => {
	it("handles a single type", () => {
		expect<Specifics>().type.toBe<NoRecord<AnyRecord>>();     // ✅
		expect<Specifics>().type.toBe<NoRecord<StringRecord>>();  // ✅
		expect<Specifics>().type.toBe<NoRecord<NumberRecord>>();  // ✅
		expect<Specifics>().type.toBe<NoRecord<SymbolRecord>>();  // ✅
	});
	it("handles type unions as the same type", () => {
		expect<Specifics>().type.toBe<NoRecord<SymbolRecord | StringRecord>>();  // ❌
		expect<NoRecord<SymbolRecord | StringRecord>>().type.toBe<Specifics>();  // ❌
		expect<Specifics>().type.toBe<NoRecord<SymbolRecord | NumberRecord>>();  // ❌
		expect<Specifics>().type.toBe<NoRecord<NumberRecord | StringRecord>>();  // ❌
	});
	it("handles type unions as assignable", () => {
		expect<Specifics>().type.toBeAssignableWith<NoRecord<SymbolRecord | StringRecord>>();  // ✅
		expect<Specifics>().type.toBeAssignableWith<NoRecord<SymbolRecord | NumberRecord>>();  // ✅
		expect<Specifics>().type.toBeAssignableWith<NoRecord<NumberRecord | StringRecord>>();  // ✅
	});
});
