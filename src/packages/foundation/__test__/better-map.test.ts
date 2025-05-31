import { expect } from "chai";
import { describe, test } from "mocha";
import { BetterMap } from "../better-map.js";

const foodTypes: readonly [string, "fruit" | "vegetable"][] = Object.freeze([
	[ "banana", "fruit" ],
	[ "apple", "fruit" ],
	[ "kale", "vegetable" ],
] as const);

describe(BetterMap.name, () => {
	test("empty", () => {
		const empty = BetterMap.empty();
		expect(empty.size, "size").eq(0);
	});

	test("from", () => {
		const map = BetterMap.from(foodTypes);
		expect(map.size, "size").eq(3);
		for (const [ k, v ] of foodTypes) {
			expect(map.has(k), k).eq(true);
			expect(map.get(k), k).eq(v);
		}
		expect(map.get("fruit"), "fruit").eq(undefined);
		expect(map.get("vegetable"), "fruit").eq(undefined);
	});

	test("clear", () => {
		const map = BetterMap.from(foodTypes);
		expect(map.size, "size before").eq(foodTypes.length);
		map.clear();
		expect(map.size, "size after").eq(0);
		for (const [ k ] of foodTypes) {
			expect(map.has(k), k).eq(false);
			expect(map.get(k), k).eq(undefined);
		}
	});

	test("copy", () => {
		const original = BetterMap.from(foodTypes);
		expect(original.size, "original size before").eq(foodTypes.length);
		const copy = original.copy();
		expect(copy.size, "copy size before").eq(foodTypes.length);
		expect(original.delete("apple"), "original delete apple").eq(true);
		expect(original.get("apple"), "original get apple").eq(undefined);
		expect(copy.get("apple"), "copy get apple").eq("fruit");
		expect(original.size, "original size after").eq(foodTypes.length - 1);
		expect(copy.size, "copy size after").eq(foodTypes.length);
		original.set("tomato", "vegetable");
		copy.set("tomato", "fruit");
		expect(original.get("tomato"), "original get tomato").eq("vegetable");
		expect(copy.get("tomato"), "copy get tomato").eq("fruit");
		original.clear();
		expect(original.size, "original size after clear").eq(0);
		expect(original.keys(), "original keys after clear").eql([]);
		expect(copy.size, "copy size after tomato").eq(foodTypes.length + 1);
	});

	test("entries", () => {
		const map = BetterMap.from(foodTypes);
		const matched = new Set<number>();
		for (const [ k, v ] of map.entries()) {
			matched.add(foodTypes.findIndex(([ fk, fv ]) => fk === k && fv === v));
		}
		const found = Array.from(matched).map((idx) => foodTypes[idx]);
		expect(found).eql(foodTypes);
	});

	test("entryIterators", () => {
		const map = BetterMap.from(foodTypes);
		const matched = new Set<number>();
		for (const [ k, v ] of map.entryIterator()) {
			matched.add(foodTypes.findIndex(([ fk, fv ]) => fk === k && fv === v));
		}
		const found = Array.from(matched).map((idx) => foodTypes[idx]);
		expect(found).eql(foodTypes);
	});

	test("getOrCompute", () => {
		const map = BetterMap.from(foodTypes);
		let calls: string[] = [];
		const supplier = (k: string): "fruit" | "vegetable" => {
			calls.push(k);
			return k === "tomato" ? "fruit" : "vegetable";
		};
		expect(map.getOrCompute("tomato", supplier), "tomato 1").eq("fruit");
		expect(calls, "calls after tomato 1").eql([ "tomato" ]);
		expect(map.getOrCompute("kale", supplier), "kale").eq("vegetable");
		expect(map.getOrCompute("banana", supplier), "banana").eq("fruit");
		expect(calls, "calls after kale and banana").eql([ "tomato" ]);
		expect(map.getOrCompute("tomato", supplier), "tomato 2").eq("fruit");
		expect(calls, "calls after tomato 2").eql([ "tomato" ]);
		expect(map.getOrCompute("carrot", supplier)).eq("vegetable");
		expect(calls, "calls after carrot 1").eql([ "tomato", "carrot" ]);
		expect(map.getOrCompute("carrot", supplier)).eq("vegetable");
		expect(calls, "calls after carrot 2").eql([ "tomato", "carrot" ]);
		expect(map.size, "size after").eq(foodTypes.length + 2);
	});

	test("keyIterator", () => {
		expect(Array.from(new Set(BetterMap.from(foodTypes).keyIterator())).sort()).eql([ "apple", "banana", "kale" ]);
	});

	test("replaceIf", () => {
		const map = BetterMap.from(foodTypes);
		const calls: [string, string][] = [];
		const replace: boolean[] = [ false, true ];
		const predicate = (existingValue: "fruit" | "vegetable", existingKey: string) => {
			calls.push([ existingValue, existingKey ]);
			return replace.shift() ?? false;
		};
		expect(map.replaceIf("carrot", "vegetable", predicate)).eq(false);
		expect(map.size, "size after carrot").eq(foodTypes.length);
		expect(calls, "calls after carrot").eql([]);
		expect(map.replaceIf("banana", "vegetable", predicate)).eq(false);
		expect(calls, "calls after banana").eql([ [ "fruit", "banana" ] ]);
		expect(map.get("banana")).eq("fruit");
		map.set("tomato", "vegetable");
		expect(map.replaceIf("tomato", "fruit", predicate)).eq(true);
		expect(calls, "calls after tomato").eql([ [ "fruit", "banana" ], [ "vegetable", "tomato" ] ]);
		expect(map.get("tomato")).eq("fruit");
	});

	test("replaceIfPresent", () => {
		const map = BetterMap.from(foodTypes);
		expect(map.replaceIfPresent("carrot", "vegetable")).eq(false);
		expect(map.get("carrot")).eq(undefined);
		expect(map.replaceIfPresent("banana", "vegetable")).eq(true);
		expect(map.get("banana")).eq("vegetable");
	});

	test("setEach", () => {
		const map = BetterMap.empty();
		map.setEach(foodTypes);
		const matched = new Set<number>();
		for (const [ k, v ] of map.entryIterator()) {
			matched.add(foodTypes.findIndex(([ fk, fv ]) => fk === k && fv === v));
		}
		const found = Array.from(matched).map((idx) => foodTypes[idx]);
		expect(found).eql(foodTypes);
	});

	test("setEachIfAbsent", () => {
		const map = BetterMap.from(foodTypes);
		map.setEachIfAbsent([
			[ "banana", "vegetable" ],
			[ "tomato", "fruit" ],
		]);
		expect(map.get("banana")).eq("fruit");
		expect(map.get("tomato")).eq("fruit");
	});

	test("toMap", () => {
		const map = BetterMap.from(foodTypes).toMap();
		expect(map).eql(new Map(foodTypes));
	});

	test("values", () => {
		const map = BetterMap.from(foodTypes);
		const values = Array.from(new Set(map.values())).sort();
		expect(values).eql([ "fruit", "vegetable" ]);
	});

	test("valueIterator", () => {
		const map = BetterMap.from(foodTypes);
		const values = Array.from(map.valueIterator()).sort();
		expect(values).eql([ "fruit", "fruit", "vegetable" ]);
	});
});
