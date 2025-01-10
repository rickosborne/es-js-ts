import { INFINITY_SIGIL, PI_SIGIL } from "@rickosborne/foundation";
import { expect } from "chai";
import { describe, it } from "mocha";
import { PI, PI_2, PI_2_3, PI_3_4, PI_9 } from "../constant.js";
import { prettyRad } from "../pretty-rad.js";

describe(prettyRad.name, () => {
	it("handles edge cases", () => {
		expect(prettyRad(NaN)).eq("NaNπ");
		expect(prettyRad(0)).eq("0");
		expect(prettyRad(Infinity)).eq(INFINITY_SIGIL.concat(PI_SIGIL));
		expect(prettyRad(-Infinity)).eq("-∞π");
	});
	it("handles easy cases", () => {
		expect(prettyRad(PI)).eq(PI_SIGIL);
		expect(prettyRad(-PI_2)).eq("-π/2");
		expect(prettyRad(PI_2_3)).eq("2π/3");
		expect(prettyRad(PI_3_4)).eq("3π/4");
		expect(prettyRad(PI_9)).eq("π/9");
	});
	it("handles degrees-like values well enough", () => {
		expect(prettyRad(59 * PI / 180)).eq("59π/180");
	});
});
