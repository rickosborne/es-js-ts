import { describe, expect, it } from "tstyche";
import type { NeverEvery } from "../never-every.js";
import type { Overwrite } from "../overwrite.js";
import type { Fruit, Vegetable } from "./fixture.js";

describe("Overwrite", () => {
	it("allows nonsense", () => {

		expect<Overwrite<{ name: string }, NonNullable<unknown>>>().type.toBe<{ name: string }>();
		expect.skip<Overwrite<{ name: string }, Record<string, never>>>().type.toBe<{ name: string }>();
		expect.skip<Overwrite<{ name: string }, object>>().type.toBe<{ name: string }>();
		// eslint-disable-next-line @typescript-eslint/ban-types
		expect.skip<Overwrite<{ name: string }, {}>>().type.toBe<{ name: string }>();

		expect.skip<Overwrite<NonNullable<unknown>, { name: string }>>().type.toBe<{ name: string }>();
		expect.skip<Overwrite<Record<string, never>, { name: string }>>().type.toBe<{ name: string }>();
		expect.skip<Overwrite<object, { name: string }>>().type.toBe<{ name: string }>();
		// eslint-disable-next-line @typescript-eslint/ban-types
		expect.skip<Overwrite<{}, { name: string }>>().type.toBe<{ name: string }>();
	});
	it("allows sense", () => {
		expect<Overwrite<Fruit, Vegetable>>().type.toBe<{
			sweet? : boolean;
		} & {
			count: bigint;
			id: number;
			name: string;
			tasty? : boolean;
		}>();

		expect<Overwrite<Vegetable, Fruit>>().type.toBe<{
			tasty?: boolean;
		} & {
			count: number;
			readonly id: number;
			name: string;
			sweet?: boolean;
		}>();

		expect<Overwrite<NeverEvery<Vegetable>, Fruit>>().type.toBe<{
			tasty?: never;
		} & {
			count: number;
			readonly id: number;
			name: string;
			sweet?: boolean;
		}>();

	});
});
