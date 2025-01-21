import { describe, expect, it, test } from "tstyche";
import type { ReboundConfigBuilder } from "../rebound-builder.js";
import { Rebound } from "../rebound.js";
import { type BoundedNumber, type IntegerSet, type LowerExclusive, type LowerInclusive, type LowerInEx, type NegInfinity, type NumberSet, type RealSet, type UpperExclusive, type UpperInclusive, type UpperInEx } from "../spec.js";

describe("Rebound", () => {
	describe("builder", () => {
		it("reduces options with each call", () => {
			const start = Rebound.buildType("test");
			expect(start).type.toBe<ReboundConfigBuilder<LowerInEx, number, NumberSet, number, UpperInEx>>();
			expect(start).type.not.toHaveProperty("build");
			expect(start).type.toHaveProperty("reals");
			expect(start).type.toHaveProperty("intOnly");
			expect(start).type.toHaveProperty("integers");
			const ints = start.integers();
			expect(ints).type.toBe<ReboundConfigBuilder<LowerInEx, number, IntegerSet, number, UpperInEx>>();
			expect(ints).type.not.toHaveProperty("build");
			expect(ints).type.not.toHaveProperty("integers");
			expect(ints).type.not.toHaveProperty("reals");
			expect(ints).type.not.toHaveProperty("intOnly");
			expect(ints).type.toHaveProperty("fromExclusive");
			expect(ints).type.toHaveProperty("fromInclusive");
			expect(ints).type.toHaveProperty("fromNegInfinity");
			expect(ints).type.toHaveProperty("fromValue");
			const lower = ints.fromNegInfinity(false);
			expect(lower).type.toBe<ReboundConfigBuilder<LowerExclusive, NegInfinity, IntegerSet, number, UpperInEx>>();
			expect(lower).type.not.toHaveProperty("build");
			expect(lower).type.not.toHaveProperty("fromExclusive");
			expect(lower).type.not.toHaveProperty("fromInclusive");
			expect(lower).type.not.toHaveProperty("fromNegInfinity");
			expect(lower).type.not.toHaveProperty("fromValue");
			expect(lower).type.toHaveProperty("toExclusive");
			expect(lower).type.toHaveProperty("toInclusive");
			expect(lower).type.toHaveProperty("toPosInfinity");
			expect(lower).type.toHaveProperty("toValue");
			const ready = lower.toInclusive(17);
			expect(ready).type.toBe<ReboundConfigBuilder<LowerExclusive, NegInfinity, IntegerSet, 17, UpperInclusive>>();
			expect(ready).type.not.toHaveProperty("toExclusive");
			expect(ready).type.not.toHaveProperty("toInclusive");
			expect(ready).type.not.toHaveProperty("toPosInfinity");
			expect(ready).type.not.toHaveProperty("toValue");
			expect(ready).type.toHaveProperty("build");
			const rebound = ready.build();
			expect(rebound).type.toBe<Rebound<"(-∞..17]", LowerExclusive, NegInfinity, IntegerSet, 17, UpperInclusive>>();
		});
		test(Rebound.prototype.guardWith.name, () => {
			const zeroOne = Rebound.buildType("ZeroOne").fromInclusive(0).toExclusive(1).reals().build();
			type ZeroOne = typeof zeroOne.numberType;
			const z1 = 0;
			const guard = zeroOne.guard;
			expect.skip(guard).type.toBe<(this: void, value: unknown) => value is BoundedNumber<{ lower: 0, lowerInc: LowerInclusive, int: RealSet, range: "[0,1)", upper: 1, upperInc: UpperExclusive }>>();
			expect.skip(guard).type.toBe<(this: void, value: unknown) => value is ZeroOne>();
			if (guard(z1)) {
				expect(z1).type.toBeAssignableTo<ZeroOne>();
			}
		});
	});
});
