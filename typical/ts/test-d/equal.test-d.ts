import { describe, expect, it } from "tstyche";
import type { Equals } from "../equal.js";

describe("Equals", () => {
	it("works", () => {
		expect<Equals<string, string>>().type.toBe<true>();
		expect<Equals<string, "abc">>().type.toBe<false>();
		expect<Equals<"abc", string>>().type.toBe<false>();

		expect<Equals<number, number>>().type.toBe<true>();
		expect<Equals<number, 123>>().type.toBe<false>();
		expect<Equals<123, number>>().type.toBe<false>();

		expect<Equals<number, number>>().type.toBe<true>();
		expect<Equals<number, 123>>().type.toBe<false>();
		expect<Equals<123, number>>().type.toBe<false>();
	});
});
