import { base56EncodeBigint } from "./base56-encode-bigint.js";
import { type NowProvider, ROID_EPOCH, ROID_MAX_MACHINE_ID, ROID_MAX_SEQUENCE_NUMBER, ROID_MAX_TIMESTAMP, ROID_PREFIX_MASK, type RoidFoundations, type RoidFunction, type RoidGenerator, type RoidOptions, type RoidSafeResult, type RoidSafeSuccess, type RoidStateManagement, type SequenceStarter } from "./roid-options.js";

/**
 * A {@link SequenceStarter} which always starts at zero.
 */
export const ROID_SEQUENCE_FROM_ZERO: SequenceStarter = () => 0;

/**
 * A {@link SequenceStarter} which starts at some random integer
 * in the lower half of the sequence number range.
 */
export const ROID_SEQUENCE_FROM_RANDOM: SequenceStarter = () => Math.floor(Math.random() * (ROID_MAX_SEQUENCE_NUMBER >> 1));

export const roid: RoidFunction = (() => {
	let _epoch: number = ROID_EPOCH;
	let _machineId: number = Math.floor(Math.random() * (ROID_MAX_MACHINE_ID + 1));
	let _timeProvider: NowProvider = Date.now;
	let _sequenceStarter: SequenceStarter = ROID_SEQUENCE_FROM_RANDOM;
	let lastTime: number = -1;
	let lastSequenceNumber: number = -1;
	const isSafeMachineId = (machineId: number): boolean => Number.isInteger(machineId) && machineId >= 0 && machineId <= ROID_MAX_MACHINE_ID;
	const isSafeSequenceNumber = (sequenceNumber: number): boolean => Number.isInteger(sequenceNumber) && sequenceNumber >= 0 && sequenceNumber <= ROID_MAX_SEQUENCE_NUMBER;
	const isSafeTimestamp = (timestamp: number): boolean => Number.isInteger(timestamp) && timestamp >= 0 && timestamp <= ROID_MAX_TIMESTAMP;
	const rangeError = (name: string, actual: number, high: number | bigint) => new RangeError(`${ name } out of range [0..${ high }]: ${ actual }`);

	function assertSafeMachineId(this: void, machineId: number): asserts machineId is number {
		if (!isSafeMachineId(machineId)) {
			throw rangeError("machineId", machineId, ROID_MAX_MACHINE_ID);
		}
	}

	function assertSafeSequenceNumber(this: void, sequenceNumber: number): asserts sequenceNumber is number {
		if (!isSafeSequenceNumber(sequenceNumber)) {
			throw rangeError("sequenceNumber", sequenceNumber, ROID_MAX_SEQUENCE_NUMBER);
		}
	}

	function assertSafeTimestamp(this: void, timestamp: number): asserts timestamp is number {
		if (!isSafeTimestamp(timestamp)) {
			throw rangeError("timestamp", timestamp, ROID_MAX_TIMESTAMP);
		}
	}

	/**
	 * The raw uint64-to-base56 implementation, with no error checking.
	 */
	const uncheckedPack = (timestamp: number, machineId: number, sequenceNumber: number): RoidSafeSuccess => {
		/**
		 * Expected to fit in (the first 62 bits of) a(n) uint64.
		 * @privateRemarks
		 * It would be nice to not have to use BigInt here, and instead have high and low uint32.
		 * But Base56 doesn't really lend itself to this.
		 */
		const uint64 = ROID_PREFIX_MASK + (BigInt(timestamp) << 20n) + (BigInt(machineId) << 8n) + BigInt(sequenceNumber);
		const id = base56EncodeBigint(uint64);
		return [ undefined, id, timestamp, machineId, sequenceNumber ];
	};
	const safePack = (timestamp: number, machineId: number, sequenceNumber: number): RoidSafeResult => {
		let error: RangeError | undefined = undefined;
		if (!isSafeTimestamp(timestamp)) {
			error = rangeError("timestamp", timestamp, ROID_MAX_TIMESTAMP);
		} else if (!isSafeMachineId(machineId)) {
			error = rangeError("machineId", machineId, ROID_MAX_MACHINE_ID);
		} else if (!isSafeSequenceNumber(sequenceNumber)) {
			error = rangeError("sequenceNumber", sequenceNumber, ROID_MAX_SEQUENCE_NUMBER);
		} else {
			return uncheckedPack(timestamp, machineId, sequenceNumber);
		}
		return [ error, undefined, undefined, undefined, undefined ];
	};
	const safe = (options: RoidOptions = {}): RoidSafeResult => {
		const {
			epoch = _epoch,
			machineId: providedMachineId,
			machineIdProvider,
			sequenceNumber: providedSequenceNumber,
			sequenceStarter = _sequenceStarter,
			time,
			timeProvider = _timeProvider,
			timestamp: providedTimestamp,
		} = options;
		let timestamp = providedTimestamp ?? ((time ?? timeProvider()) - epoch);
		const machineId = providedMachineId ?? machineIdProvider?.() ?? _machineId;
		let sequenceNumber: number;
		if (providedSequenceNumber != null) {
			sequenceNumber = providedSequenceNumber;
		} else if (timestamp > lastTime) {
			sequenceNumber = sequenceStarter();
			lastTime = timestamp;
		} else if (lastSequenceNumber >= ROID_MAX_SEQUENCE_NUMBER) {
			lastTime++;
			timestamp = lastTime;
			sequenceNumber = 0;
		} else {
			timestamp = lastTime;
			sequenceNumber = lastSequenceNumber + 1;
		}
		lastSequenceNumber = sequenceNumber;
		return safePack(timestamp, machineId, sequenceNumber);
	};
	const pack = (timestamp: number, machineId: number, sequenceNumber: number): string => {
		const [ error, id ] = safePack(timestamp, machineId, sequenceNumber);
		if (id != null) {
			return id;
		}
		throw error;
	};
	const generator: RoidGenerator = (options: RoidOptions = {}): string => {
		const [ error, id ] = safe(options);
		if (id != null) {
			return id;
		}
		throw error;
	};
	const foundations: RoidFoundations = {
		get EPOCH_DEFAULT(): number {
			return ROID_EPOCH;
		},
		get MAX_MACHINE_ID(): number {
			return ROID_MAX_MACHINE_ID;
		},
		get MAX_SAFE_TIMESTAMP(): number {
			return ROID_MAX_TIMESTAMP;
		},
		get MAX_SEQUENCE_NUMBER(): number {
			return ROID_MAX_SEQUENCE_NUMBER;
		},
		assertSafeMachineId,
		assertSafeSequenceNumber,
		assertSafeTimestamp,
		isSafeMachineId,
		isSafeSequenceNumber,
		isSafeTimestamp,
		pack,
		safePack,
		safe,
	};
	const stateManagement: RoidStateManagement = {
		get epoch(): number {
			return _epoch;
		},
		set epoch(earliestTimestamp: number) {
			assertSafeTimestamp(earliestTimestamp);
			_epoch = earliestTimestamp;
		},
		get machineId(): number {
			return _machineId;
		},
		set machineId(machineId: number) {
			assertSafeMachineId(machineId);
			_machineId = machineId;
		},
		resetTracking(): void {
			lastSequenceNumber = -1;
			lastTime = -1;
		},
		get sequenceStarter(): SequenceStarter {
			return _sequenceStarter;
		},
		set sequenceStarter(starter: SequenceStarter) {
			_sequenceStarter = starter;
		},
		get timeProvider(): NowProvider {
			return _timeProvider;
		},
		set timeProvider(provider: NowProvider) {
			_timeProvider = provider;
		},
	};
	return Object.defineProperties(generator, {
		...Object.getOwnPropertyDescriptors(stateManagement),
		...Object.getOwnPropertyDescriptors(foundations),
	}) as RoidFunction;
})();
