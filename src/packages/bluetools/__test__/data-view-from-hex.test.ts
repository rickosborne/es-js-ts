import { expect } from "chai";
import { describe, test } from "mocha";
import { dataViewFromHex, hexFromDataView } from "../data-view-from-hex.js";

describe("data view from hex", () => {
	test("round trip", () => {
		const originalHex = "00010203ff";
		const dataView = dataViewFromHex(originalHex);
		const roundHex = hexFromDataView(dataView);
		expect(roundHex).eq(originalHex);
	});
});
