import { expect } from "chai";
import { describe, test } from "mocha";
import { TupleMap } from "../tuple-map.js";

type PrimaryColor = "blue" | "red" | "yellow";

const colorCombos: [[PrimaryColor, PrimaryColor], string][] = [
	[ [ "blue", "red" ], "purple" ],
	[ [ "red", "yellow" ], "orange" ],
	[ [ "blue", "yellow" ], "green" ],
];

describe(TupleMap.name, () => {
	test("from", () => {
		const map = TupleMap.from(2, colorCombos);
		expect(map.get([ "red", "yellow" ])).eq("orange");
		expect(map.get([ "yellow", "red" ])).eq(undefined);
		expect(map.get([ "blue", "yellow" ])).eq("green");
		expect(map.get([ "yellow", "blue" ])).eq(undefined);
		expect(map.size).eq(3);
		map.clear();
		expect(map.size).eq(0);
		expect(map.get([ "blue", "yellow" ])).eq(undefined);
	});

	test("forKeyLength", () => {
		const map = TupleMap.forKeyLength<[PrimaryColor, PrimaryColor], string, 2>(2);
		expect(map.size).eq(0);
		for (const [ k, v ] of colorCombos) {
			expect(map.has(k)).eq(false);
			expect(map.get(k)).eq(undefined);
			map.set(k, v);
			expect(map.get(k)).eq(v);
			expect(map.has(k)).eq(true);
		}
		expect(map.size).eq(colorCombos.length);
	});

	test("throws for bogus key length", () => {
		expect(() => TupleMap.forKeyLength(1)).throws(RangeError);
		expect(() => TupleMap.forKeyLength(2.5)).throws(RangeError);
	});

	test("copy", () => {
		const original = TupleMap.from(2, colorCombos);
		const copy = original.copy();
		expect(copy.size).eq(colorCombos.length);
		expect(copy.get([ "red", "yellow" ])).eq("orange");
	});

	test("delete", () => {
		const map = TupleMap.from(2, colorCombos);
		expect(map.get([ "red", "yellow" ])).eq("orange");
		expect(map.delete([ "red", "yellow" ])).eq(true);
		expect(map.size).eq(colorCombos.length - 1);
		expect(map.get([ "red", "yellow" ])).eq(undefined);
		expect(map.get([ "blue", "yellow" ])).eq("green");
		expect(map.delete([ "red", "yellow" ])).eq(false);
		expect(map.delete([ "blue", "yellow" ])).eq(true);
		expect(map.entries()).eql([ [ [ "blue", "red" ], "purple" ] ]);
		expect(map.size).eq(1);
		expect(map.delete([ "blue", "red" ])).eq(true);
		expect(map.entries()).eql([ ]);
		expect(map.size).eq(0);
	});

	test("entryIterator", () => {
		const map = TupleMap.from(2, colorCombos);
		for (const [ k, v ] of map.entryIterator()) {
			const original = colorCombos.find(([ ok, ov ]) => ov === v && k.every((kn, i) => ok[i] === kn));
			expect(original).not.undefined;
		}
	});

	test("getOrCompute", () => {
		const map = TupleMap.from(2, colorCombos);
		const calls: unknown[] = [];
		const compute = (key: [PrimaryColor, PrimaryColor]): string => {
			calls.push(key);
			return "computed";
		};
		expect(map.getOrCompute([ "red", "yellow" ], compute)).eq("orange");
		expect(calls).eql([ ]);
		expect(map.getOrCompute([ "red", "blue" ], compute)).eq("computed");
		expect(calls).eql([ [ "red", "blue" ] ]);
		expect(map.getOrCompute([ "red", "blue" ], compute)).eq("computed");
		expect(calls).eql([ [ "red", "blue" ] ]);
		expect(map.size).eq(colorCombos.length + 1);
	});

	test("keyIterator", () => {
		const map = TupleMap.from(2, colorCombos);
		for (const key of map.keyIterator()) {
			const found = colorCombos.find(([ k ]) => k.every((kv, kn) => kv === key[kn]));
			expect(found).not.undefined;
		}
	});

	test("keys", () => {
		const map = TupleMap.from(2, colorCombos);
		for (const key of map.keys()) {
			const found = colorCombos.find(([ k ]) => k.every((kv, kn) => kv === key[kn]));
			expect(found).not.undefined;
		}
	});
});
