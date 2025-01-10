import { describe, expect, it } from "tstyche";
import type { NonNull } from "../non-null.js";

describe("NonNull", () => {
	it("only filters out null", () => {
		expect<NonNull<never>>().type.toBe<never>();
		expect<NonNull<undefined>>().type.toBe<undefined>();
		expect<NonNull<null>>().type.toBe<never>();
		expect<NonNull<null | undefined>>().type.toBe<undefined>();
		expect<NonNull<string>>().type.toBe<string>();
		expect<NonNull<string | null>>().type.toBe<string>();
		expect<NonNull<string | undefined>>().type.toBe<string | undefined>();
		expect<NonNull<string | null | undefined>>().type.toBe<string | undefined>();
		expect<NonNull<object>>().type.toBe<object>();
		expect<NonNull<object | null>>().type.toBe<object>();
		expect<NonNull<object | undefined>>().type.toBe<object | undefined>();
		expect<NonNull<object | null | undefined>>().type.toBe<object | undefined>();
	});
});
