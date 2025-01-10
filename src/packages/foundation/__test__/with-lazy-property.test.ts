import { assertDefined } from "@rickosborne/guard";
import { describe, it } from "mocha";
import { expect } from "chai";
import { withLazyProperty } from "../with-lazy-property.js";

describe(withLazyProperty.name, () => {
	it("does what it says", () => {
		const fruit = { name: "banana" };
		const price = 10;
		let callCount = 0;
		const calculator = (target: unknown) => {
			expect(target, "target").eq(fruit);
			expect(callCount, "callCount").eq(0);
			callCount++;
			return price;
		};
		const smartFruit = withLazyProperty(fruit, "price", calculator);
		expect(smartFruit).eq(fruit);
		const desc1 = Object.getOwnPropertyDescriptor(fruit, "price");
		assertDefined(desc1, "descriptor 1");
		expect(desc1.configurable).eq(true);
		expect(desc1.enumerable).eq(true);
		expect(typeof desc1.get).eq("function");
		expect("price" in fruit).eq(true);
		expect(Object.hasOwn(fruit, "price")).eq(true);
		expect(callCount).eq(0);
		expect(smartFruit.price).eq(price);
		expect(callCount).eq(1);
		const desc2 = Object.getOwnPropertyDescriptor(fruit, "price");
		assertDefined(desc2, "descriptor 2");
		expect(desc2.configurable).eq(false);
		expect(desc2.enumerable).eq(true);
		expect(desc2.value).eq(price);
		expect(smartFruit.price).eq(price);
		expect(callCount).eq(1);
	});
});
