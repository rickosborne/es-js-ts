import { expect } from "chai";
import { describe, it } from "mocha";
import { asFraction } from "../as-fraction.js";

const SMALL_PRIMES = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97 ];

describe(asFraction.name, () => {
	it("works for low values", () => {
		const primes = SMALL_PRIMES.flatMap((n) => [ n, -n ].concat(1));
		for (const n of primes) {
			for (const d of SMALL_PRIMES.concat(1)) {
				let expected = [ n, d ];
				if (n === d) {
					expected = [ 1, 1 ];
				} else if (n === -d) {
					expected = [ -1, 1 ];
				}
				expect(asFraction(n / d), `${ n }/${ d }`).eql(expected);
			}
		}
	});
	it("works for infinity, NaN, and zero", () => {
		expect(asFraction(Infinity), "+∞").eql([ Infinity, 1 ]);
		expect(asFraction(-Infinity), "-∞").eql([ -Infinity, 1 ]);
		expect(asFraction(NaN), "NaN").eql([ NaN, 1 ]);
		expect(asFraction(0), "0").eql([ 0, 1 ]);
	});
	it("works for effectively-integers", () => {
		expect(asFraction(5.00000000001), "lots of zeroes").eql([ 5, 1 ]);
		expect(asFraction(4.99999999999), "lots of nines").eql([ 5, 1 ]);
		expect(asFraction(-5.00000000001), "neg zeros").eql([ -5, 1 ]);
		expect(asFraction(-4.99999999999), "neg nines").eql([ -5, 1 ]);
	});
	it("throws for bad percent error", () => {
		expect(() => asFraction(5, 0)).throws(RangeError);
		expect(() => asFraction(5, 1)).throws(RangeError);
		expect(() => asFraction(5, 90)).throws(RangeError);
	});
});
