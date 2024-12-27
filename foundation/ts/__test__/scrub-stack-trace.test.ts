import { assertDefined, scrubStackTrace } from "@rickosborne/guard";
import { expect } from "chai";
import { describe, it } from "mocha";

describe(scrubStackTrace.name, () => {
	it("leaves in lines with @rickosborne", () => {
		let error: Error | undefined;
		try {
			assertDefined(undefined, "undefined");
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e;
			}
		}
		expect(error != null).eq(true);
		expect(error?.stack).includes("scrub-stack-trace.test.ts");
		expect(error?.stack).to.not.include("/node_modules/");
	});
});
