import { expect } from "chai";
import { describe, it } from "mocha";
import { formatBytes } from "../format-bytes.js";

describe(formatBytes.name, () => {
	it("handles zero", () => {
		expect(formatBytes(0)).eq("0B");
		expect(formatBytes(0, 1024)).eq("0B");
		expect(formatBytes(0, 1000)).eq("0B");
	});
	it("handles negatives", () => {
		expect(formatBytes(-12345, 1000)).eq("-12.3KB");
		expect(formatBytes(-12345, 1024)).eq("-12.1KiB");
	});
	it("handles low values", () => {
		expect(formatBytes(1010, 1000)).eq("1.01KB");
		expect(formatBytes(1010, 1024)).eq("1010B");
	});
	it("handles big values", () => {
		expect(formatBytes(123_456_789_012_345)).eq("112TiB");
		expect(formatBytes(123_456_789_012_345, 1000)).eq("123TB");
		expect(formatBytes(123_456_789_012_345_678_901_234n)).eq("104ZiB");
		expect(formatBytes(123_456_789_012_345_678_901_234_567n, 1000)).eq("123YB");
	});
});
