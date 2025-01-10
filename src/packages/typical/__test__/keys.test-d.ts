import { describe, expect, it } from "tstyche";
import type { Equals } from "../equal.js";
import type { IfSpecificKeys } from "../keys.js";
import type { SpecificKey } from "../keys.js";
import { type CombinedKeys, FlagKeys, OptionalKeys, type ReadOnlyKeys, RequiredKeys, type SharedKeys, type SpecificKeys } from "../keys.js";
import type { Vegetable } from "./fixture.js";
import type { Fruit } from "./fixture.js";
import type { Basics } from "./fixture.js";
import type { someSymbol } from "./fixture.js";


type BasicsNoAdmin = {
	readonly id: string;
	maybe?: boolean;
	name: string;
	nick?: string;
}


type IdAndMaybe = {
	readonly id: string;
	maybe?: boolean;
}


type IdAndMaybeBroken = {
	id: string;
	maybe?: boolean;
}

describe("Keys", () => {
	it("SpecificKeys", () => {
		expect<SpecificKeys<Basics>>().type.toBe<"admin" | "id" | "maybe" | "name" | "nick">();
		expect<SpecificKeys<Fruit>>().type.toBe<"count" | "id" | "name" | "sweet">();
		expect<SpecificKeys<Vegetable>>().type.toBe<"count" | "id" | "name" | "tasty">();
	});
	it("RequiredKeys", () => {
		expect<RequiredKeys<Basics>>().type.toBe<"admin" | "id" | "name">();
	});
	it("OptionalKeys", () => {
		expect<OptionalKeys<Basics>>().type.toBe<"maybe" | "nick">();
	});
	it("FlagKeys", () => {
		expect<FlagKeys<Basics>>().type.toBe<"admin" | "maybe">();
	});
	it("ReadOnlyKeys", () => {
		expect<ReadOnlyKeys<Basics>>().type.toBe<"id">();
	});
	it("SharedKeys", () => {
		expect<SharedKeys<IdAndMaybe, Basics>>().type.toBe<"id" | "maybe">();
		expect<SharedKeys<Basics, IdAndMaybe>>().type.toBe<"id" | "maybe">();
		expect<SharedKeys<Fruit, Record<string, never>>>().type.toBe<never>();
		expect<SharedKeys<Fruit, Vegetable>>().type.toBe<"count" | "id" | "name">();
	});
	it("CombinedKeys", () => {
		expect<CombinedKeys<{ a: string }, { b: number }>>().type.toBe<"a" | "b">();
	});
	it("SpecificKeys", () => {
		expect<SpecificKeys<NonNullable<unknown>>>().type.toBe<never>();
		expect<SpecificKeys<Record<string, never>>>().type.toBe<never>();
		expect<SpecificKeys<object>>().type.toBe<never>();
// eslint-disable-next-line @typescript-eslint/ban-types
		expect<SpecificKeys<{}>>().type.toBe<never>();

		expect<SpecificKeys<{ name: string } | Record<string, never>>>().type.toBe<"name">();
		expect<SpecificKeys<{ name: string } | object>>().type.toBe<"name">();
// eslint-disable-next-line @typescript-eslint/ban-types
		expect<SpecificKeys<{ name: string } | {}>>().type.toBe<"name">();

		expect<SpecificKeys<Record<symbol | number | "foo", unknown>>>().type.toBe<"foo">();
		expect<SpecificKeys<Record<symbol | 123 | string, unknown>>>().type.toBe<123>();
		expect<SpecificKeys<Record<typeof someSymbol | number | string, unknown>>>().type.toBe<typeof someSymbol>();
		expect<SpecificKeys<Record<string | symbol | number, unknown>>>().type.toBe<never>();
	});
	it("SpecificKey", () => {
		expect<SpecificKey<symbol | number | "foo">>().type.toBe<"foo">();
		expect<SpecificKey<symbol | 123 | string>>().type.toBe<123>();
		expect<SpecificKey<typeof someSymbol | number | string>>().type.toBe<typeof someSymbol>();
		expect<SpecificKey<symbol | number | string>>().type.toBe<never>();
		expect<SpecificKey<typeof someSymbol | 123 | "foo">>().type.toBe<typeof someSymbol | 123 | "foo">();
	});
	it("IfSpecificKey", () => {
		expect<IfSpecificKeys<object>>().type.toBe<never>();
// eslint-disable-next-line @typescript-eslint/ban-types
		expect<IfSpecificKeys<{}>>().type.toBe<never>();
		expect<IfSpecificKeys<Record<string, never>>>().type.toBe<never>();
		expect<IfSpecificKeys<NonNullable<unknown>>>().type.toBe<never>();
		expect<IfSpecificKeys<Fruit>>().type.toBe<Fruit>();
		expect<IfSpecificKeys<Vegetable>>().type.toBe<Vegetable>();
	});
	it("Omit", () => {
		expect<Equals<BasicsNoAdmin, Omit<Basics, "admin">>>().type.toBe<true>();
		expect<Omit<Basics, "admin">>().type.toBe<BasicsNoAdmin>();
	});
	it("Pick", () => {
		expect<Equals<Pick<Basics, "id" | "maybe">, IdAndMaybe>>().type.toBe<true>();
		expect<Equals<Pick<Basics, "id" | "maybe">, IdAndMaybeBroken>>().type.toBe<false>();
		expect<Equals<Pick<Basics, "id" | "maybe">, Pick<IdAndMaybeBroken, "id" | "maybe">>>().type.toBe<false>();
	});
});
