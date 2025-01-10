import { A_GT_B, A_LT_B, EQ } from "@rickosborne/typical";
import { expect } from "chai";
import { describe, it } from "mocha";
import { asIndexKey, ecmaKeySort } from "../ecma-key-sort.js";

describe(ecmaKeySort.name, () => {
	it("puts integer indexes first", () => {
		expect(ecmaKeySort("a", "1"), "a,1").eq(A_GT_B);
		expect(ecmaKeySort("1", "a"), "1,a").eq(A_LT_B);
		expect(ecmaKeySort("1", "1"), "1,1").eq(EQ);
	});
	it("puts text keys in lex order", () => {
		expect(ecmaKeySort("a", "a"), "a,a").eq(EQ);
		expect(ecmaKeySort("a", "b"), "a,b").lt(0);
		expect(ecmaKeySort("b", "a"), "b,a").gt(0);
	});
	it("puts integer keys in numeric order", () => {
		expect(ecmaKeySort("1", "2"), "1,2").lt(0);
		expect(ecmaKeySort("2", "1"), "2,1").gt(0);
		expect(ecmaKeySort("2", "2"), "2,2").eq(EQ);
		expect(ecmaKeySort("23", "101"), "23,101").lt(0);
		expect(ecmaKeySort("101", "23"), "101,23").gt(0);
	});
});

describe(asIndexKey.name, () => {
	it("identifies positive integers", () => {
		expect(asIndexKey("0")).eq(0);
		expect(asIndexKey("123")).eq(123);
	});
	it("skips anything else", () => {
		expect(asIndexKey("0123")).eq(undefined);
		expect(asIndexKey("-0")).eq(undefined);
		expect(asIndexKey("-123")).eq(undefined);
		expect(asIndexKey("abc")).eq(undefined);
		expect(asIndexKey("1_234")).eq(undefined);
		expect(asIndexKey("1.234")).eq(undefined);
	});
});
