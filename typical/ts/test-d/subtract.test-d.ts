import { describe, expect, it } from "tstyche";

import type { Subtract } from "../subtract.js";
import type { Fruit, Vegetable } from "./fixture.js";

describe("Subtract", () => {
	it("works in order", () => {
		expect<Subtract<Fruit, Vegetable>>().type.toBe<{ sweet?: boolean }>();
		expect<Subtract<Vegetable, Fruit>>().type.toBe<{ tasty?: boolean }>();
		expect<Subtract<Fruit, Record<string, never>>>().type.toBe<Fruit>();
	});
});
