import { describe, expect, test } from "tstyche";
import type { DeepMerge } from "../deep-merge.js";

describe("DeepMerge", () => {
	test("non-objects", () => {
		expect<DeepMerge<string, boolean>>().type.toBe<boolean>();
		expect<DeepMerge<{foo: string}, boolean>>().type.toBe<boolean>();
		expect<DeepMerge<unknown[], boolean>>().type.toBe<boolean>();
		expect<DeepMerge<{foo: string}, object>>().type.toBeAssignableTo<{foo: string}>();
	});
	test("Objects", () => {
		expect<DeepMerge<{ foo: string }, { bar: number }>>().type.toBeAssignableTo<{ bar: number; foo: string }>();
		expect<DeepMerge<{ foo: { bar: boolean; baz: string } }, { foo: { bar: number } }>>().type.toBeAssignableTo<{ foo: { bar: number; baz: string } }>();
	});
});
