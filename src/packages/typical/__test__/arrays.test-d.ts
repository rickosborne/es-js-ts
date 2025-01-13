import { describe, expect, it } from "tstyche";
import type { ItemType } from "../arrays.js";

describe("ItemType", () => {
	it("works for arrays", () => {
		expect<ItemType<string[]>>().type.toBe<string>();
		expect<ItemType<number[][]>>().type.toBe<number[]>();
		expect<ItemType<never[]>>().type.toBeNever();
	});
});
