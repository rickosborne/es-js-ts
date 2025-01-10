import { expect } from "chai";
import { describe, it } from "mocha";
import { addProperties, addProperty } from "../add-property.js";

const start = { start: "start" };

describe(addProperty.name, () => {
	it("can add non-enumerated value props", () => {
		const stop = addProperty({ ...start }, "stop", { enumerable: false, value: "stop" });
		expect(stop.start).eq("start");
		expect(stop.stop).eq("stop");
		expect(Object.keys(stop)).eql([ "start" ]);
	});
	it("can add enumerated value props", () => {
		const stop = addProperty({ ...start }, "stop", { enumerable: true, value: "stop" });
		expect(Object.keys(stop)).eql([ "start", "stop" ]);
		expect(stop).eql({ start: "start", stop: "stop" });
	});
	it("can add getter-only props", () => {
		const stop = addProperty({ ...start }, "stop", { enumerable: true, get: () => "stop" });
		expect(Object.keys(stop)).eql([ "start", "stop" ]);
		expect(stop).eql({ start: "start", stop: "stop" });
		expect(() => (stop as Record<string, unknown>)["stop"] = "restart").throws(TypeError, "Cannot set property stop");
		expect(stop.stop).eq("stop");
	});
	it("can add get-set props", () => {
		let setValue: string | undefined;
		const stop = addProperty({ ...start }, "stop", {
			enumerable: true,
			get: () => "stop",
			set(value: string) {
				setValue = value;
			},
		});
		expect(Object.keys(stop)).eql([ "start", "stop" ]);
		expect(stop).eql({ start: "start", stop: "stop" });
		stop.stop = "restart";
		expect(stop.stop).eq("stop");
		expect(setValue).eq("restart");
	});
});

describe(addProperties.name, () => {
	it("does all of the above at once", () => {
		const fruit = { apple: "apple" };
		let durian: string = "durian";
		let eggplant: number | undefined = undefined;
		const basket = addProperties(fruit, {
			banana: { get: () => "banana" },
			cherry: { value: "cherry" },
			durian: {
				get: () => durian,
				set(value: string) {
					durian = value;
				},
			},
			eggplant: {
				set(value: number) {
					eggplant = value;
				},
			},
			fig: {
				value: "fig",
				writable: true,
			},
		});
		expect(() => (basket as Record<string, unknown>)["banana"] = "ignored").throws(TypeError, "Cannot set property banana");
		expect(basket.banana).eq("banana");
		expect(() => (basket as Record<string, unknown>)["cherry"] = "ignored").throws(TypeError, "Cannot assign to read only property 'cherry'");
		expect(basket.cherry).eq("cherry");
		expect(basket.durian).eq("durian");
		basket.durian = "DURIAN";
		expect(basket.durian).eq("DURIAN");
		expect(durian).eq("DURIAN");
		expect(basket.eggplant).eq(undefined);
		expect(eggplant).eq(undefined);
		basket.eggplant = 123;
		expect(basket.eggplant).eq(undefined);
		expect(eggplant).eq(123);
		expect(basket.fig).eq("fig");
		basket.fig = "FIG";
		expect(basket.fig).eq("FIG");
	});
});
