import { describe, expect, it } from "tstyche";
import type { DeepValued, Valued } from "../valued.js";

describe("Valued", () => {
	it("filters out both null and undefined", () => {
		expect<Valued<never>>().type.toBe<never>();
		expect<Valued<undefined>>().type.toBe<never>();
		expect<Valued<null>>().type.toBe<never>();
		expect<Valued<null | undefined>>().type.toBe<never>();
		expect<Valued<string>>().type.toBe<string>();
		expect<Valued<string | null>>().type.toBe<string>();
		expect<Valued<string | undefined>>().type.toBe<string>();
		expect<Valued<string | null | undefined>>().type.toBe<string>();
		expect<Valued<object>>().type.toBe<object>();
		expect<Valued<object | null>>().type.toBe<object>();
		expect<Valued<object | undefined>>().type.toBe<object>();
		expect<Valued<object | null | undefined>>().type.toBe<object>();
	});
});

describe("DeepValued", () => {
	it("Recurses", () => {
		expect<DeepValued<never>>().type.toBe<never>();
		expect<DeepValued<undefined>>().type.toBe<never>();
		expect<DeepValued<null>>().type.toBe<never>();
		expect<DeepValued<string | null>>().type.toBe<string>();
		expect<DeepValued<boolean | undefined>>().type.toBe<boolean>();
		expect<DeepValued<(number | null)[]>>().type.toBe<number[]>();
		expect<DeepValued<{values: (number | undefined)[]}>>().type.toBe<{values: number[]}>();
	});
});
