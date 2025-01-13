import { expect } from "chai";
import { describe, it } from "mocha";
import { CSSError } from "../css-error.js";

describe(CSSError.name, () => {
	it("has the correct name", () => {
		const noMessage = new CSSError();
		expect(noMessage.name).eq(CSSError.name);
		expect(noMessage.text).eq(undefined);
		expect(noMessage.message).eq("Error in CSS");
		expect(noMessage.href).eq(undefined);
		expect(noMessage.expected).eq(undefined);
	});
});
