import { Runnable as RunnableBarrel } from "@rickosborne/typical";
import {Runnable as RunnableDirect} from "@rickosborne/typical/runnable";
import { describe, expect, it } from "tstyche";

describe("imports", () => {
	it("barrel", () => {
		expect<RunnableBarrel>().type.toBe<() => void>();
		expect<RunnableBarrel>().type.not.toBe<() => number>();
		expect<RunnableBarrel>().type.not.toBeAny();
	});
	it("direct", () => {
		expect<RunnableDirect>().type.toBe<() => void>();
		expect<RunnableDirect>().type.not.toBe<() => number>();
		expect<RunnableDirect>().type.not.toBeAny();
	});
	it("is the same", () => {
		expect<RunnableBarrel>().type.toBe<RunnableDirect>();
		expect<RunnableDirect>().type.toBe<RunnableBarrel>();
	});
});
