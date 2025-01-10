import { describe, expect, it } from "tstyche";
import type { Either } from "../either.js";
import { type Fruit, type Vegetable } from "./fixture.js";

describe("Either", () => {
	it("masks out each side", () => {
		expect<Omit<Fruit, keyof Vegetable>>().type.toBe<{ sweet?: boolean }>();

		expect<Omit<Fruit, "count" | "name">>().type.toBe<{ readonly id: number; sweet?: boolean }>();

		expect<Either<Fruit, Vegetable>>().type.toBe<({
			count: number;
			readonly id: number;
			name: string;
			sweet?: boolean;
		} & {
			tasty?: never;
		}) | ({
			count: bigint;
			id: number;
			name: string;
			tasty?: boolean;
		} & {
			sweet?: never;
		})>();

	});
});
