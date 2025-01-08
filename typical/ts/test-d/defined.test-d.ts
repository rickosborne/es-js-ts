import type { Defined } from "../defined.js";
import { describe, expect, it } from "tstyche";

describe("Defined", () => {
	it("only filters out undefined", () => {
		expect<Defined<never>>().type.toBe<never>();
		expect<Defined<undefined>>().type.toBe<never>();
		expect<Defined<null>>().type.toBe<null>();
		expect<Defined<null | undefined>>().type.toBe<null>();
		expect<Defined<string>>().type.toBe<string>();
		expect<Defined<string | null>>().type.toBe<string | null>();
		expect<Defined<string | undefined>>().type.toBe<string>();
		expect<Defined<string | null | undefined>>().type.toBe<string | null>();
		expect<Defined<object>>().type.toBe<object>();
		expect<Defined<object | null>>().type.toBe<object | null>();
		expect<Defined<object | undefined>>().type.toBe<object>();
		expect<Defined<object | null | undefined>>().type.toBe<object | null>();
		expect<Defined<string | undefined>>().type.toBe<string>();
	});
});

