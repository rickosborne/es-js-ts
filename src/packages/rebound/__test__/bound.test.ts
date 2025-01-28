import { describe, it, test } from "mocha";
import { expect } from "chai";
import { Bound } from "../bound.js";

describe(Bound.name, () => {
	const lt3 = Bound.lt(3);
	const lte3 = Bound.lte(3);
	const gt3 = Bound.gt(3);
	const gte3 = Bound.gte(3);
	const lt4 = Bound.lt(4);
	test(Bound.prototype.compareTo.name, () => {
		const sorted = [ lt4, lt3, gt3, gte3, lte3 ].sort((a, b) => a.compareTo(b));
		expect(sorted).eql([ lt3, lte3, gte3, gt3, lt4 ]);
		expect(lt3.compareTo(lt3), "===").eq(0);
	});
	test("isInc", () => {
		expect(lt3.isInc, lt3.toString()).eq(false);
		expect(lte3.isInc, lte3.toString()).eq(true);
		expect(gt3.isInc, gt3.toString()).eq(false);
		expect(gte3.isInc, gte3.toString()).eq(true);
		expect(lt4.isInc, lt4.toString()).eq(false);
	});
	describe(Bound.prototype.isValid.name, () => {
		const examples: [number, Bound<number>, boolean][] = [
			[ 3, lt3, false ],
			[ 3, lte3, true ],
			[ 3, gte3, true ],
			[ 3, gt3, false ],
			[ 3, lt4, true ],
			[ 2, lt3, true ],
			[ 2, gte3, false ],
			[ 4, gt3, true ],
			[ 4, lte3, false ],
		];
		for (const [ v, b, e ] of examples) {
			it(`${v}${b.toString()}`, () => {
				expect(b.isValid(v), `${v}${b.toString()}`).eq(e);
			});
		}
	});
});
