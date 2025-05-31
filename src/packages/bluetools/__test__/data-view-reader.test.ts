import { expect } from "chai";
import { describe, test } from "mocha";
import { dataViewFromHex } from "../data-view-from-hex.js";
import { DataViewReader } from "../data-view-reader.js";

const testOne = (
	hex: string,
	expected: number,
	accessor: (reader: DataViewReader) => number,
): void => {
	const dataView = dataViewFromHex(hex);
	const dvr = DataViewReader.forDataView(dataView);
	const actual = accessor(dvr);
	if (Number.isNaN(expected)) {
		expect(actual, `${hex} -> ${expected}`).is.NaN;
	} else {
		expect(actual, `${hex} -> ${expected}`).eq(expected);
	}
};

const testMany = (
	hex: string,
	...pairs: [expected: number, accessor: (reader: DataViewReader) => number][]
): void => {
	const dataView = dataViewFromHex(hex);
	const dvr = DataViewReader.forDataView(dataView);
	for (const [ expected, accessor ] of pairs) {
		const actual = accessor(dvr);
		expect(actual, `${hex} -> ${expected}`).eq(expected);
	}
};

/**
 * Test values via:
 * {@link https://github.com/matanamir/int24/blob/master/test/int24-test.js}
 */
describe(DataViewReader.name, () => {
	test("uint24", () => {
		testOne("000000", 0, (dvr) => dvr.uint24());
		testOne("4e61bc", 12345678, (dvr) => dvr.uint24());
		testOne("ffffff", 16777215, (dvr) => dvr.uint24());
	});

	test("int24", () => {
		testOne("010080", -8388607, (dvr) => dvr.int24());
		testOne("87d612", 1234567, (dvr) => dvr.int24());
		testOne("ffff7f", 8388607, (dvr) => dvr.int24());
	});

	test("nibble", () => {
		testMany("00", [ 0, (dvr) => dvr.nibble() ], [ 0, (dvr) => dvr.nibble() ]);
		testMany("12", [ 1, (dvr) => dvr.nibble() ], [ 2, (dvr) => dvr.nibble() ]);
		testMany("FE", [ 0xF, (dvr) => dvr.nibble() ], [ 0xE, (dvr) => dvr.nibble() ]);
	});

	test("SFLOAT", () => {
		testOne("FF07", Number.NaN, (dvr) => dvr.float16());
		testOne("0008", Number.NaN, (dvr) => dvr.float16());
		testOne("0108", Number.NaN, (dvr) => dvr.float16());
		testOne("FE07", Infinity, (dvr) => dvr.float16());
		testOne("0208", -Infinity, (dvr) => dvr.float16());
		testOne("FFFF", -0.1, (dvr) => dvr.float16());
		testOne("FEFF", -0.2, (dvr) => dvr.float16());
		testOne("FE0F", -2, (dvr) => dvr.float16());
		testOne("FE7F", -20000000, (dvr) => dvr.float16());
		testOne("0280", 2e-8, (dvr) => dvr.float16());
		testOne("7200", 114, (dvr) => dvr.float16());
	});

	test("FLOAT", () => {
		testOne("FEFF7F00", Infinity, (dvr) => dvr.float32());
		testOne("FFFF7F00", Number.NaN, (dvr) => dvr.float32());
		testOne("00008000", Number.NaN, (dvr) => dvr.float32());
		testOne("01008000", Number.NaN, (dvr) => dvr.float32());
		testOne("02008000", -Infinity, (dvr) => dvr.float32());
		testOne("6C0100FF", 36.4, (dvr) => dvr.float32());
	});
});
