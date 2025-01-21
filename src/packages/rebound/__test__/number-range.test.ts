import { expect } from "chai";
import { describe, it, test } from "mocha";
import { IntegerRange, NumberRange, RealRange } from "../number-range.js";
import { RangeBase } from "../range-base.js";

describe(IntegerRange.name, () => {
	const oneFiveII = new IntegerRange(1, 5);
	const threeFourInt = new IntegerRange(3, 4);
	const threeFourReal = new RealRange(true, 3, 4, true);
	const threeSixInt = new IntegerRange(3, 6);
	const threeSixReal = new RealRange(true, 3, 6, true);
	const gteOne = new IntegerRange(1, Infinity);
	const lteOne = new IntegerRange(-Infinity, 1);
	const gteFive = new IntegerRange(5, Infinity);
	const lteFive = new IntegerRange(-Infinity, 5);
	const eqThree = new IntegerRange(3, 3);
	const eqThreeReal = new RealRange(true, 3, 3, true);
	const allInt = new IntegerRange(-Infinity, Infinity);
	const intRanges = [ oneFiveII, gteOne, lteOne, eqThree, gteFive, lteFive, threeFourInt, threeSixInt, allInt ];
	const allRanges = (intRanges.slice() as NumberRange[]).concat(eqThreeReal, threeFourReal, threeSixReal);
	describe(RangeBase.prototype.contains.name, () => {
		it("is aware of inclusive/exclusive", () => {
			for (const range of intRanges) {
				for (const n of [ 0, 1, 3, 5, 6, 7, -Infinity, Infinity ]) {
					expect(range.contains(n), `${ n } in ${ range.label }`).eq(
						(range.isLowerInc ? (range.lower <= n) : (range.lower < n))
						&& (range.isUpperInc ? (range.upper >= n) : (range.upper > n)),
					);
				}
				expect(range.contains(3.5), `3.5 in ${ range.label }`).eq(false);
			}
			expect(eqThree.isSingleton, "=3 singleton").eq(true);
			expect(eqThree.isEmpty, "=3 empty").eq(false);
			expect(eqThree.discreteIntegers, "=3 discreteIntegers").eq(1);
			expect(eqThreeReal.isSingleton, "=3R singleton").eq(true);
			expect(eqThreeReal.isEmpty, "=3R singleton").eq(false);
		});
	});
	describe(RangeBase.prototype.encloses.name, () => {
		const testEncloses = (a: NumberRange, b: NumberRange, forward: boolean, backward: boolean): void => {
			expect(a.encloses(b), `${ a.label } >= ${ b.label }`).eq(forward);
			expect(b.encloses(a), `${ b.label } >= ${ a.label }`).eq(backward);
		};
		const examples: [ NumberRange, NumberRange, boolean, boolean ][] = [
			[ oneFiveII, threeFourInt, true, false ],
			[ oneFiveII, threeSixInt, false, false ],
			[ oneFiveII, gteOne, false, true ],
			[ oneFiveII, lteFive, false, true ],
			[ gteOne, gteOne, true, true ],
			[ gteOne, gteFive, true, false ],
			[ threeFourInt, threeSixInt, false, true ],
			[ threeFourReal, threeSixInt, false, false ],
			[ threeFourInt, threeFourReal, false, true ],
			[ allInt, oneFiveII, true, false ],
			[ allInt, gteOne, true, false ],
			[ allInt, lteOne, true, false ],
			[ allInt, gteFive, true, false ],
			[ allInt, lteFive, true, false ],
			[ allInt, threeFourInt, true, false ],
			[ allInt, threeSixInt, true, false ],
			[ eqThree, eqThreeReal, false, true ],
		];
		for (const [ a, b, fwd, back ] of examples) {
			it(`${ a.label } >= ${ b.label }`, () => {
				testEncloses(a, b, fwd, back);
			});
		}
	});
	test("isA", () => {
		expect(allInt.isA("string")).eq(false);
		expect(allInt.isA(Number.NaN)).eq(false);
		expect(allInt.isA(0)).eq(true);
		expect(allInt.isA(0.5)).eq(false);
	});
	test("compareTo", () => {
		const sorted = allRanges.slice().sort((a, b) => a.compareTo(b));
		expect(sorted).eql([
			// All unbounded-lower first, ordered by upper bound
			lteOne,
			lteFive,
			allInt,
			// Now order by lower, then upper
			oneFiveII,
			gteOne,
			eqThree,
			eqThreeReal,
			// Int ranges are smaller than Real ranges with the same bounds
			threeFourInt,
			threeFourReal,
			threeSixInt,
			threeSixReal,
			// Unbounded upper
			gteFive,
		]);
		expect(threeFourInt.compareTo(threeFourReal)).lt(0);
		expect(threeFourReal.compareTo(threeFourInt)).gt(0);
	});
	describe("scaleValueFrom", () => {
		const examples: [ after: NumberRange, before: NumberRange, input: number, output: number ][] = [
			[ threeFourInt, threeFourReal, 3, 3 ],
			[ threeFourInt, threeFourReal, 4, 4 ],
			[ threeFourReal, threeFourInt, 3, 3 ],
			[ threeFourInt, threeFourReal, 3.5, 4 ],
			[ threeFourReal, threeFourInt, 4, 4 ],
			[ threeFourInt, oneFiveII, 1, 3 ],
			[ threeFourInt, oneFiveII, 5, 4 ],
			[ oneFiveII, threeSixInt, 3, 1 ],
			[ oneFiveII, threeSixInt, 6, 5 ],
			[ threeFourReal, threeSixReal, 3, 3 ],
			[ threeFourReal, threeSixReal, 6, 4 ],
			[ eqThree, threeSixReal, 3, 3 ],
			[ eqThree, threeSixReal, 6, 3 ],
			[ eqThreeReal, threeSixReal, 3, 3 ],
			[ eqThreeReal, threeSixReal, 6, 3 ],
		];
		for (const [ a, b, v, s ] of examples) {
			test(`${ b.label } : ${ v } -> ${ s } : ${ a.label }`, () => {
				expect(a.scaleValueFrom(v, b), `${ b.label } : ${ v } -> ${ s } : ${ a.label }`).eq(s);
			});
		}
	});
});
