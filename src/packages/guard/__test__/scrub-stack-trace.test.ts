import { describe, it } from "mocha";
import { expect } from "chai";
import { assertDefined } from "../is-defined.js";
import { scrubStackTrace } from "../scrub-stack-trace.js";

class Test {
	public buildError(): Error {
		return scrubStackTrace(new Error("from Test.buildError"));
	}

	public buildAnonymousErrorWithRegExp(): Error {
		return scrubStackTrace(new Error("some other message"), /scrub-stack-trace/);
	}

	public buildAnonymousErrorWithPredicate(): Error {
		return scrubStackTrace(new Error("some message"), (line) => line.includes("scrub-stack-trace"));
	}

	public buildAnonymousErrorWithText(): Error {
		return scrubStackTrace(new Error("some third message"), "scrub-stack-trace");
	}
}

describe(scrubStackTrace.name, () => {
	it("should be human-readable", () => {
		const original = new Error("whatever");
		assertDefined(original.stack, "original.stack");
		const scrubbed = scrubStackTrace(original);
		assertDefined(scrubbed.stack, "scrubbed.stack");
		expect(scrubbed.stack).not.eql(original.stack);
		expect(scrubbed.stack).not.to.match(/node:internal/);
		expect(scrubbed.stack).not.to.match(/\/node_modules\//);
	});
	it("leaves methods intact", () => {
		const built = new Test().buildError();
		expect(built.stack).match(/buildError/);
		expect(built.stack).not.to.match(/node:internal/);
		expect(built.stack).not.to.match(/\/node_modules\//);
	});
	it("can use a custom RegExp to remove", () => {
		const built = new Test().buildAnonymousErrorWithRegExp();
		expect(built.stack).includes(built.message);
		expect(built.stack).not.to.match(/scrub-stack-trace/);
		expect(built.stack).not.to.match(/node:internal/);
		expect(built.stack).not.to.match(/\/node_modules\//);
	});
	it("can use a custom predicate to remove", () => {
		const built = new Test().buildAnonymousErrorWithPredicate();
		expect(built.stack).includes(built.message);
		expect(built.stack).not.to.match(/scrub-stack-trace/);
		expect(built.stack).not.to.match(/node:internal/);
		expect(built.stack).not.to.match(/\/node_modules\//);
	});
	it("can use a custom predicate to remove", () => {
		const built = new Test().buildAnonymousErrorWithText();
		expect(built.stack).includes(built.message);
		expect(built.stack).not.to.match(/scrub-stack-trace/);
		expect(built.stack).not.to.match(/node:internal/);
		expect(built.stack).not.to.match(/\/node_modules\//);
	});
	it("allows repeated application without any changes", () => {
		const built = new Test().buildAnonymousErrorWithText();
		expect(built.stack).includes(built.message);
		expect(built.stack).not.to.match(/scrub-stack-trace/);
		expect(built.stack).not.to.match(/node:internal/);
		expect(built.stack).not.to.match(/\/node_modules\//);
	});
});
