import { expect } from "chai";
import { describe, it } from "mocha";
import { chainableComparator, comparatorBuilder } from "../comparator.js";

type Hue = {
	name: string;
	value: number;
}

const red: Hue = { name: "red", value: 0 };
const orange: Hue = { name: "orange", value: 30 };
const blue: Hue = { name: "blue", value: 240 };
const rebeccaPurple: Partial<Hue> = { name: "rebeccapurple" };
const cyan: Partial<Hue> = { value: 120 };

const byNumberAsc = comparatorBuilder<Partial<Hue>>()
	.num((h) => h.value)
	.build();

const byNumberDesc = comparatorBuilder<Partial<Hue>>()
	.num((h) => h.value).desc
	.build();

const byNumberNullsFirst = comparatorBuilder<Partial<Hue>>()
	.num((h) => h.value)
	.nullsFirst
	.build();

const byNumberNullsLast = comparatorBuilder<Partial<Hue>>()
	.num((h) => h.value)
	.nullsLast
	.build();

const byStringAsc = comparatorBuilder<Partial<Hue>>()
	.str((h) => h.name)
	.build();

const byStringDesc = comparatorBuilder<Partial<Hue>>()
	.str((h) => h.name).desc
	.build();

const byStringNullsFirst = comparatorBuilder<Partial<Hue>>()
	.str((h) => h.name).nullsFirst
	.build();

const byStringNullsLast = comparatorBuilder<Partial<Hue>>()
	.str((h) => h.name).nullsLast
	.build();

describe(comparatorBuilder.name, () => {
	it("works for simple numeric cases", () => {
		expect(byNumberAsc(red, orange), "red orange asc").lessThan(0);
		expect(byNumberAsc(orange, red), "orange red asc").greaterThan(0);
		expect(byNumberAsc(red, red), "red red asc").eq(0);
		expect(byNumberDesc(red, orange), "red orange desc").greaterThan(0);
		expect(byNumberDesc(orange, red), "orange red desc").lessThan(0);
		expect(byNumberDesc(red, red), "red red desc").eq(0);
	});
	it("can put nulls before or after numbers", () => {
		expect(byNumberNullsFirst(blue, rebeccaPurple), "blue rp nulls first").greaterThan(0);
		expect(byNumberNullsFirst(rebeccaPurple, blue), "rp blue nulls last").lessThan(0);
		expect(byNumberNullsLast(blue, rebeccaPurple), "blue rp nulls first").lessThan(0);
		expect(byNumberNullsLast(rebeccaPurple, blue), "rp blue nulls last").greaterThan(0);
		expect(byNumberNullsFirst(rebeccaPurple, rebeccaPurple), "rp rp nulls first").eq(0);
		expect(byNumberNullsLast(rebeccaPurple, rebeccaPurple), "rp rp nulls first").eq(0);
	});
	it("defaults to nulls last for numbers", () => {
		expect(byNumberAsc(blue, rebeccaPurple), "blue rp asc").lessThan(0);
		expect(byNumberAsc(rebeccaPurple, blue), "rp blue asc").greaterThan(0);
		expect(byNumberDesc(blue, rebeccaPurple), "blue rp desc").greaterThan(0);
		expect(byNumberDesc(rebeccaPurple, blue), "rp blue desc").lessThan(0);
	});
	it("works for simple string cases", () => {
		expect(byStringAsc(red, orange), "red orange asc").greaterThan(0);
		expect(byStringAsc(orange, red), "orange red asc").lessThan(0);
		expect(byStringAsc(red, red), "red red asc").eq(0);
		expect(byStringDesc(red, orange), "red orange desc").lessThan(0);
		expect(byStringDesc(orange, red), "orange red desc").greaterThan(0);
		expect(byStringDesc(red, red), "red red desc").eq(0);
	});
	it("defaults to nulls last for strings", () => {
		expect(byStringAsc(cyan, rebeccaPurple), "cyan rp asc").greaterThan(0);
		expect(byStringAsc(rebeccaPurple, cyan), "rp cyan asc").lessThan(0);
		expect(byStringDesc(cyan, rebeccaPurple), "cyan rp desc").lessThan(0);
		expect(byStringDesc(rebeccaPurple, cyan), "rp cyan desc").greaterThan(0);
	});
	it("can put nulls before or after strings", () => {
		// defaults to nulls last
		expect(byStringNullsFirst(cyan, rebeccaPurple), "cyan rp nulls first").lessThan(0);
		expect(byStringNullsFirst(rebeccaPurple, cyan), "rp cyan nulls last").greaterThan(0);
		expect(byStringNullsLast(cyan, rebeccaPurple), "cyan rp nulls first").greaterThan(0);
		expect(byStringNullsLast(rebeccaPurple, cyan), "rp cyan nulls last").lessThan(0);
		expect(byStringNullsFirst(cyan, cyan), "cyan cyan nulls first").eq(0);
		expect(byStringNullsLast(cyan, cyan), "cyan cyan nulls first").eq(0);
	});
	it("can be combined with chainables", () => {
		const nullsFirst = chainableComparator(byStringAsc).nullsFirst;
		expect(nullsFirst(cyan, blue)).greaterThan(0);
		expect(nullsFirst(cyan, null)).greaterThan(0);
		expect(nullsFirst(undefined, cyan)).lessThan(0);
		expect(nullsFirst(null, undefined)).eq(0);
	});
});
