export interface RoidOptions {
	/**
	 * The earliest possible timestamp.
	 * Defaults to the first second of 2026.
	 */
	epoch?: number;
	/**
	 * An integer in the range `[0,4095]`.
	 */
	machineId?: number;
	/**
	 * A function which provides an integer in the range `[0,4095]`.
	 */
	machineIdProvider?: () => number;
	/**
	 * An integer in the range `[0,255]`.
	 */
	sequenceNumber?: number;
	/**
	 * Override the default behavior of picking a random number
	 * as the start of each sequence number.
	 */
	sequenceStarter?: SequenceStarter;
	/**
	 * Usually, the result of `Date.now()`.
	 */
	time?: number;
	/**
	 * Defaults to `Date.now`, but can be overridden for tests
	 * or because you have your own clock.
	 */
	timeProvider?: NowProvider;
	/**
	 * The value of `time - epoch`.
	 * Generally only used for testing.
	 */
	timestamp?: number;
}

/**
 * A function which returns the current JS timestamp.
 * That is, milliseconds since the first second of 1970.
 */
export type NowProvider = () => number;

/**
 * Return a random starting sequence number.
 * This is confined to the range [0..255], but you may want to
 * return something like [0..127] to avoid overflow.
 */
export type SequenceStarter = () => number;

/**
 * Generate a roid.
 */
export type RoidGenerator = (options?: RoidOptions) => string;

export type RoidSafeError = [ error: RangeError, id: undefined, timestamp: undefined, machineId: undefined, sequenceNumber: undefined ];
export type RoidSafeSuccess = [ error: undefined, id: string, timestamp: number, machineId: number, sequenceNumber: number ];
export type RoidSafeResult = RoidSafeError | RoidSafeSuccess;

export interface RoidFoundations {
	readonly EPOCH_DEFAULT: number;
	readonly MAX_MACHINE_ID: number;
	readonly MAX_SAFE_TIMESTAMP: number;
	readonly MAX_SEQUENCE_NUMBER: number;

	assertSafeTimestamp(this: void, timestamp: number): asserts timestamp is number;

	assertSafeMachineId(this: void, machineId: number): asserts machineId is number;

	assertSafeSequenceNumber(this: void, sequenceNumber: number): asserts sequenceNumber is number;

	isSafeMachineId(this: void, machineId: number): boolean;

	isSafeSequenceNumber(this: void, sequenceNumber: number): boolean;

	isSafeTimestamp(this: void, timestamp: number): boolean;

	/**
	 * Check the values, pack them into a(n) unit64, and base56-encode it.
	 */
	pack(this: void, timestamp: number, machineId: number, sequenceNumber: number): string;

	/**
	 * Like the top-level `roid()` call, but will return errors instead of throwing them.
	 */
	safe(this: void, options?: RoidOptions): RoidSafeResult;

	/**
	 * Check the values, pack them into a(n) unit64, and base56-encode it.
	 * If there are errors, return them instead of throwing.
	 */
	safePack(this: void, timestamp: number, machineId: number, sequenceNumber: number): RoidSafeResult;
}

export interface RoidStateManagement {
	get epoch(): number;

	set epoch(earliestTimestamp: number);

	get machineId(): number;

	set machineId(machineId: number);

	/**
	 * Intended for testing, you can get duplicate IDs if you reset tracking.
	 */
	resetTracking(): void;

	get sequenceStarter(): SequenceStarter;

	set sequenceStarter(starter: SequenceStarter);

	get timeProvider(): NowProvider;

	set timeProvider(clock: NowProvider);
}

/**
 * The roid value generator, with all the extra state management functions, foundation utilities, and constants.
 */
export interface RoidFunction extends RoidGenerator, RoidFoundations, RoidStateManagement {
}

export const ROID_EPOCH = Date.UTC(2026, 0, 1);
export const ROID_MAX_TIMESTAMP = Math.pow(2, 42) - 1;
export const ROID_MAX_MACHINE_ID = Math.pow(2, 12) - 1;
export const ROID_MAX_SEQUENCE_NUMBER = 255;
export const ROID_LENGTH = 11;
export const ROID_PREFIX_MASK = 1n << 62n;
