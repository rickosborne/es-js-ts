import { expect } from "chai";
import { describe, it, test } from "mocha";
import { unbounded } from "../range-like.js";
import { StringRange } from "../string-range.js";

describe(StringRange.name, () => {
	const any = new StringRange(true, unbounded, unbounded, true);
	const bOnly = new StringRange(true, "b", "c", false);
	const gteC = new StringRange(true, "c", unbounded, true);
	describe("contains", () => {
		const examples: [StringRange, string, boolean][] = [
			[ any, "", true ],
			[ bOnly, "", false ],
			[ gteC, "", false ],
			[ any, "b", true ],
			[ bOnly, "b", true ],
			[ gteC, "b", false ],
			[ any, "bee", true ],
			[ bOnly, "bee", true ],
			[ gteC, "bee", false ],
			[ any, "c", true ],
			[ bOnly, "c", false ],
			[ gteC, "c", true ],
			[ any, "cat", true ],
			[ bOnly, "cat", false ],
			[ gteC, "cat", true ],
		];
		for (const [ range, text, expected ] of examples) {
			it(`${JSON.stringify(text)} in ${range.label}`, () => {
				expect(range.contains(text)).eq(expected);
			});
		}
	});
	describe("encloses", () => {
		const examples: [StringRange, StringRange, boolean, boolean][] = [
			[ any, bOnly, true, false ],
			[ any, gteC, true, false ],
			[ bOnly, gteC, false, false ],
		];
		for (const [ a, b, forward, reverse ] of examples) {
			test(`${a.label} <=> ${b.label}`, () => {
				expect(a.encloses(b), `${a.label} >= ${b.label}`).eq(forward);
				expect(b.encloses(a), `${b.label} >= ${a.label}`).eq(reverse);
			});
		}
	});
	test("isA", () => {
		expect(any.isA({})).eq(false);
		expect(any.isA(undefined)).eq(false);
		expect(any.isA("")).eq(true);
		expect(bOnly.isA("")).eq(false);
		expect(bOnly.isA("bat")).eq(true);
	});
});
