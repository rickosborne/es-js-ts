import { describe, expect, it } from "tstyche";
import type { NeverEvery } from "../never-every.js";
import type { Vegetable } from "./fixture.js";
import type { Fruit } from "./fixture.js";

describe("NeverEvery", () => {
	it("masks out all value types", () => {
		expect<NeverEvery<Fruit>>().type.toBe<{
			count?: never;
			readonly id?: never;
			name?: never;
			sweet?: never;
		}>();

		expect<NeverEvery<Vegetable>>().type.toBe<{
			count?: never;
			id?: never;
			name?: never;
			tasty?: never;
		}>();

	});
});
