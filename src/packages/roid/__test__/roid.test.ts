import { describe, test } from "mocha";
import { expect } from "chai";
import { type NowProvider, ROID_EPOCH, ROID_LENGTH, ROID_MAX_MACHINE_ID, ROID_MAX_SEQUENCE_NUMBER, ROID_MAX_TIMESTAMP, type RoidSafeResult, type SequenceStarter } from "../roid-options.js";
import { roid, ROID_SEQUENCE_FROM_RANDOM, ROID_SEQUENCE_FROM_ZERO } from "../roid.js";

describe(roid.name, () => {
	describe("generator", () => {
		test("no options", () => {
			expect(roid().length).eq(ROID_LENGTH);
		});
		test("first id", () => {
			expect(roid({ machineId: 0, sequenceNumber: 0, timestamp: 0 })).eq("HDU8U8Pz8Na");
			expect(roid({ machineId: 0, sequenceStarter: ROID_SEQUENCE_FROM_ZERO, timestamp: 0 })).eq("HDU8U8Pz8Na");
			expect(roid.pack(0, 0, 0)).eq("HDU8U8Pz8Na");
		});
		test("second id", () => {
			expect(roid({ machineId: 0, sequenceNumber: 1, timestamp: 0 })).eq("HDU8U8Pz8Nb");
		});
		test("last id", () => {
			expect(roid({
				machineId: ROID_MAX_MACHINE_ID,
				sequenceNumber: ROID_MAX_SEQUENCE_NUMBER,
				timestamp: ROID_MAX_TIMESTAMP,
			})).eq("YQwEwEmyEj9");
			expect(roid.pack(ROID_MAX_TIMESTAMP, ROID_MAX_MACHINE_ID, ROID_MAX_SEQUENCE_NUMBER)).eq("YQwEwEmyEj9");
		});
		test("the last roid timestamp is in 2165", () => {
			const last = new Date(ROID_MAX_TIMESTAMP + ROID_EPOCH);
			expect(last.toISOString()).eq("2165-05-15T07:35:11.103Z");
		});
		test("error in options", () => {
			expect(() => roid({ machineId: -1 })).throws(RangeError).matches(/machineId/);
		});
		test("1970 epoch", () => {
			expect(roid({
				epoch: 0,
				machineId: 0,
				time: 0,
				sequenceNumber: 0,
			})).eq("HDU8U8Pz8Na");
		});
		test("sequence bump", () => {
			const timeProvider: NowProvider = (): number => {
				return ROID_EPOCH + 12345;
			};
			let sequenceCalls = 0;
			const sequenceStarter = (): number => {
				expect(sequenceCalls).eq(0);
				sequenceCalls++;
				return 0;
			};
			expect(roid({
				machineId: 0,
				sequenceStarter,
				timeProvider,
			})).eq("HDU8UXuFDGs");
			expect(roid({
				machineId: 0,
				sequenceStarter,
				timeProvider,
			})).eq("HDU8UXuFDGt");
			expect(roid({
				machineId: 0,
				sequenceStarter,
				timeProvider,
			})).eq("HDU8UXuFDGu");
		});
	});
	describe("safe/pack", () => {
		const fields: [name: string, max: number, callable: (v: number) => RoidSafeResult, (v: number) => string, validator: (n: number) => boolean, asserter: (n: number) => asserts n is number][] = [
			[ "timestamp", ROID_MAX_TIMESTAMP, (t) => roid.safePack(t, 0, 0), (t) => roid.pack(t, 0, 0), roid.isSafeTimestamp, roid.assertSafeTimestamp ],
			[ "machineId", ROID_MAX_MACHINE_ID, (m) => roid.safePack(0, m, 0), (m) => roid.pack(0, m, 0), roid.isSafeMachineId, roid.assertSafeMachineId ],
			[ "sequenceNumber", ROID_MAX_SEQUENCE_NUMBER, (s) => roid.safePack(0, 0, s), (s) => roid.pack(0, 0, s), roid.isSafeSequenceNumber, roid.assertSafeSequenceNumber ],
		];
		for (const [ field, max, safePack, pack, isValid, asserter ] of fields) {
			const namePattern = new RegExp(field);
			test(`${field} underflow`, () => {
				const [ error ] = safePack(-1);
				expect(error).instanceOf(RangeError).matches(namePattern);
				expect(() => pack(-1)).throws(RangeError).matches(namePattern);
			});
			test(`${field} overflow`, () => {
				const [ error ] = safePack(max + 1);
				expect(error).instanceOf(RangeError).matches(namePattern);
				expect(() => pack(max + 1)).throws(RangeError).matches(namePattern);
			});
			test(`${field} not int`, () => {
				const [ error ] = safePack(1.23);
				expect(error).instanceOf(RangeError).matches(namePattern);
				expect(() => pack(1.23)).throws(RangeError).matches(namePattern);
			});
			test(`${field} = NaN`, () => {
				const [ error ] = safePack(Number.NaN);
				expect(error).instanceOf(RangeError).matches(namePattern);
				expect(() => pack(Number.NaN)).throws(RangeError).matches(namePattern);
			});
			test(`${field} validator`, () => {
				expect(isValid(-1)).eq(false);
				expect(isValid(0)).eq(true);
				expect(isValid(max)).eq(true);
				expect(isValid(max + 1)).eq(false);
				expect(isValid(Number.NaN)).eq(false);
				expect(isValid(3.45)).eq(false);
			});
			test(`${field} asserter`, () => {
				expect(() => asserter(-1)).throws(RangeError).matches(namePattern);
				expect(() => asserter(max + 1)).throws(RangeError).matches(namePattern);
				expect(() => asserter(7.89)).throws(RangeError).matches(namePattern);
			});
		}
	});
	describe("state management", () => {
		test("default epoch is 2026", () => {
			expect(roid.epoch).eq(ROID_EPOCH);
			expect(roid.EPOCH_DEFAULT).eq(ROID_EPOCH);
			expect(new Date(ROID_EPOCH).getUTCFullYear()).eq(2026);
		});
		test("constants", () => {
			expect(roid.EPOCH_DEFAULT).eq(ROID_EPOCH);
			expect(roid.MAX_MACHINE_ID).eq(ROID_MAX_MACHINE_ID);
			expect(roid.MAX_SAFE_TIMESTAMP).eq(ROID_MAX_TIMESTAMP);
			expect(roid.MAX_SEQUENCE_NUMBER).eq(ROID_MAX_SEQUENCE_NUMBER);
		});
		test("bad epoch", () => {
			expect(() => {
				roid.epoch = -1;
			}).throws(RangeError).matches(/timestamp/);
		});
		test("global machineId", () => {
			const machineIdBefore = roid.machineId;
			expect(() => {
				roid.machineId = 4.5;
			}).throws(RangeError).matches(/machineId/);
			expect(roid.machineId).eq(machineIdBefore);
			try {
				const inverse = ROID_MAX_MACHINE_ID - machineIdBefore;
				roid.machineId = inverse;
				expect(roid.machineId).eq(inverse);
			} finally {
				roid.machineId = machineIdBefore;
			}
		});
		test("global epoch", () => {
			const epoch2000 = Date.UTC(2000, 0, 1);
			try {
				roid.epoch = epoch2000;
				expect(roid.epoch).eq(epoch2000);
				const withGlobal = roid({ machineId: 0, sequenceNumber: 0, time: epoch2000 + 12345 });
				roid.epoch = ROID_EPOCH;
				expect(roid.epoch).eq(ROID_EPOCH);
				const withLocal = roid({ epoch: epoch2000, machineId: 0, sequenceNumber: 0, time: epoch2000 + 12345 });
				expect(withGlobal).eq(withLocal);
				const manual = roid({ machineId: 0, sequenceNumber: 0, timestamp: 12345 });
				expect(manual).eq(withGlobal);
			} finally {
				roid.epoch = ROID_EPOCH;
			}
		});
		test("global sequence starter", () => {
			const start123: SequenceStarter = () => {
				return 123;
			};
			try {
				roid.sequenceStarter = start123;
				expect(roid.sequenceStarter).eq(start123);
				const withGlobal = roid({ machineId: 0, time: 2468 + ROID_EPOCH });
				roid.sequenceStarter = ROID_SEQUENCE_FROM_RANDOM;
				roid();  // reset the incrementer
				expect(roid.sequenceStarter).eq(ROID_SEQUENCE_FROM_RANDOM);
				const withLocal = roid({ machineId: 0, sequenceStarter: start123, time: 2468 + ROID_EPOCH });
				expect(withGlobal).eq(withLocal);
			} finally {
				roid.sequenceStarter = ROID_SEQUENCE_FROM_RANDOM;
			}
		});
		test("global time provider", () => {
			const timeProvider: NowProvider = () => ROID_EPOCH + 642;
			try {
				roid.timeProvider = timeProvider;
				expect(roid.timeProvider).eq(timeProvider);
				const withGlobal = roid({ machineId: 0, sequenceNumber: 0 });
				roid.timeProvider = Date.now;
				const withLocal = roid({ machineId: 0, sequenceNumber: 0, timeProvider });
				expect(withGlobal).eq(withLocal);
			} finally {
				roid.timeProvider = Date.now;
			}
		});
	});
});
