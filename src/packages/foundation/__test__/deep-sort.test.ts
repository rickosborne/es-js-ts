import { expect } from "chai";
import { describe, it } from "mocha";
import { deepSort } from "../deep-sort.js";

type Fruit = {
	list?: Fruit[];
	name?: string;
	price?: number;
}

describe(deepSort.name, () => {
	it("does what it says", () => {
		const fruit: Fruit = {};
		fruit.price = 10;
		fruit.name = "banana";
		const durian: Fruit = { price: 5 };
		durian.name = "durian";
		const kiwi: Fruit = { name: "kiwi" };
		kiwi.list = [];
		fruit.list = [ kiwi, durian ];
		const unsortedJson = JSON.stringify(fruit);
		// Notice the out-of-order properties.
		expect(unsortedJson).eq('{"price":10,"name":"banana","list":[{"name":"kiwi","list":[]},{"price":5,"name":"durian"}]}');
		const sorted = deepSort(fruit);
		const sortedJson = JSON.stringify(sorted);
		// Now the properties are in-order, while the arrays are kept as they were.
		expect(sortedJson).eq('{"list":[{"list":[],"name":"kiwi"},{"name":"durian","price":5}],"name":"banana","price":10}');
		expect(JSON.parse(sortedJson)).eql(fruit);
	});
	it("can handle cycles", () => {
		const durian: Fruit = { name: "durian" };
		const lime: Fruit = { name: "lime" };
		const kiwi: Fruit = { name: "kiwi" };
		durian.list = [ lime ];
		lime.list = [ kiwi ];
		kiwi.list = [ durian ];
		const sorted = deepSort(durian);
		expect(sorted).eql(durian);
		expect(sorted).to.not.eq(durian);
	});
	it("allows ECMA sorted keys", () => {
		const original: Record<string, string> = {};
		original["b"] = "b";
		original["a"] = "a";
		expect(Object.keys(original)).eql([ "b", "a" ]);
		original["23"] = "23";
		original["101"] = "101";
		// sigh.  Sociopaths.
		expect(Object.keys(original)).eql([ "23", "101", "b", "a" ]);
		const ecma = deepSort(original, { keySorting: "ecma" });
		expect(ecma, "ecma").not.eq(original);
		expect(Object.keys(ecma), "ecma").eql([ "23", "101", "a", "b" ]);
		const text = deepSort(original, { keySorting: "text" });
		expect(text, "text").not.eq(original);
		expect(Object.keys(text), "text").eql([ "101", "23", "a", "b" ]);
	});
});
