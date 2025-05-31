import { describe, expect, it } from "tstyche";
// eslint-disable-next-line no-shadow
import type { GetPropertyDescriptor, GetSetPropertyDescriptor, IfReadOnlyDescriptor, IfReadWriteDescriptor, IfWriteOnlyDescriptor, ReadOnlyPropertyDescriptor, SetPropertyDescriptor, TypedPropertyDescriptor, ValuePropertyDescriptor } from "../add-property.js";

const valueReadWrite = {
	value: 123,
} satisfies TypedPropertyDescriptor<number> & ValuePropertyDescriptor<number>;

const valueReadOnly = {
	value: 123,
	writable: false,
} satisfies TypedPropertyDescriptor<number> & ReadOnlyPropertyDescriptor & ValuePropertyDescriptor<number>;

const getReadOnly = {
	get: () => 123,
} satisfies TypedPropertyDescriptor<number> & GetPropertyDescriptor<number>;

const getSetReadWrite = {
	get: () => 123,
	set: () => {
		// do nothing
	},
} satisfies TypedPropertyDescriptor<number> & GetSetPropertyDescriptor<number>;

const setWriteOnly = {
	set: (num: number) => {
		if (num > 0) {
			throw new Error("message");
		}
	},
} satisfies TypedPropertyDescriptor<number> & SetPropertyDescriptor<number>;

describe("IfReadOnlyDescriptor", () => {
	it("finds readonly", () => {
		expect<IfReadOnlyDescriptor<true, typeof valueReadOnly>>().type.toBe(true);
		expect<IfReadOnlyDescriptor<true, typeof getReadOnly>>().type.toBe(true);
	});
	it("is never otherwise", () => {
		expect<IfReadOnlyDescriptor<true, typeof valueReadWrite>>().type.toBeNever();
		expect<IfReadOnlyDescriptor<true, typeof getSetReadWrite>>().type.toBeNever();
		expect<IfReadOnlyDescriptor<true, typeof setWriteOnly>>().type.toBeNever();
	});
});

describe("IfReadWriteDescriptor", () => {
	it("finds read-write", () => {
		expect<IfReadWriteDescriptor<true, typeof valueReadWrite>>().type.toBe(true);
		expect<IfReadWriteDescriptor<true, typeof getSetReadWrite>>().type.toBe(true);
	});
	it("is never otherwise", () => {
		expect<IfReadWriteDescriptor<true, typeof valueReadOnly>>().type.toBeNever();
		expect<IfReadWriteDescriptor<true, typeof getReadOnly>>().type.toBeNever();
		expect<IfReadWriteDescriptor<true, typeof setWriteOnly>>().type.toBeNever();
	});
});

describe("IfWriteOnlyDescriptor", () => {
	it("finds read-write", () => {
		expect<IfWriteOnlyDescriptor<true, typeof setWriteOnly>>().type.toBe(true);
	});
	it("is never otherwise", () => {
		expect<IfWriteOnlyDescriptor<true, typeof valueReadWrite>>().type.toBeNever();
		expect<IfWriteOnlyDescriptor<true, typeof valueReadOnly>>().type.toBeNever();
		expect<IfWriteOnlyDescriptor<true, typeof getReadOnly>>().type.toBeNever();
		expect<IfWriteOnlyDescriptor<true, typeof getSetReadWrite>>().type.toBeNever();
	});
});
