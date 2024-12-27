import { expect } from "chai";
import { describe, it } from "mocha";
import { memoize, memoizeSupplier } from "../memoize.js";

describe(memoizeSupplier.name, () => {
	it("can be used via memoize", () => {
		expect(memoize).eq(memoizeSupplier);
	});
	it("inherits the name of the supplier", () => {
		expect(memoizeSupplier(function whatever() {
			throw new Error("never called");
		}).name).eq("whatever");
		expect(memoizeSupplier(() => void (1)).name).eq("");
	});
	it("calls the supplier at most once", () => {
		let callCount = 0;
		const countCalls = () => ++callCount;
		const lazy = memoizeSupplier(countCalls);
		expect(callCount).eq(0);
		expect(lazy()).eq(1);
		expect(callCount).eq(1);
		expect(lazy()).eq(1);
		expect(callCount).eq(1);
	});
});
