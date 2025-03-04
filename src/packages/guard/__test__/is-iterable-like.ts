import { expect } from "chai";
import { describe, test } from "mocha";
import { isAsyncIterableLike, isIterableLike } from "../is-iterable-like.js";

const testIterableGuard = <T>(guard: (value: unknown) => value is T, predicate?: (v: unknown) => (boolean | undefined)) => {
	const testOne = (name: string, value: unknown, expected: boolean): void => {
		test(name, () => expect(guard(value)).eq(predicate?.(value) ?? expected));
	};
	testOne("string", "", true);
	testOne("array", [], true);

	testOne("Map", new Map(), true);
	testOne("Set", new Set(), true);

	testOne("number", 123, false);
	testOne("boolean", true, false);
	testOne("object", {}, false);
	testOne("null", null, false);
	testOne("undefined", undefined, false);
	testOne("WeakMap", new WeakMap(), false);
	testOne("WeakSet", new WeakSet(), false);
	testOne("WeakRef", new WeakRef({}), false);
};

describe(isIterableLike.name, () => {
	testIterableGuard(isIterableLike);
});

describe(isAsyncIterableLike.name, () => {
	testIterableGuard(isAsyncIterableLike, (v) => v instanceof Map || v instanceof Set ? false : undefined);
});
