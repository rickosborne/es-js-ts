import { addProperty } from "./add-property.js";

export interface RNGOptions {
	a?: number | bigint;
	c?: number | bigint;
	floor?: number;
	m?: number | bigint;
	seed?: number | bigint | undefined;
	width?: number;
}

export interface RNG {
	around(this: void, radius: number, inclusive?: boolean | undefined): number;

	bigInt(this: void, bits?: number | undefined): bigint;

	clone(): RNG;

	/**
	 * Return a decimal value in the range `[0,1)`, like `Math.random`.
	 */
	float01(this: void): number;

	/**
	 * Equivalent to `range(0, length)`.
	 */
	index(this: void, length: number): number;

	int(this: void): number;

	ints(this: void, count?: number): Generator<number, undefined, undefined>;

	readonly name: string;

	range(this: void, low: number, high: number): number;

	ranges(this: void, low: number, high: number, count?: number): Generator<number, undefined, undefined>;
}

interface LinearCongruentialEngine {
	readonly maxBig: bigint;
	readonly maxInt: number;
	readonly state: bigint;

	next(bits?: number): bigint;
}

const intAndBigFrom = (n: number | bigint): [ number, bigint ] => {
	if (typeof n === "number") return [ n, BigInt(n) ];
	return [ Number(n), n ];
};

function linearCongruentialEngine(options: RNGOptions): LinearCongruentialEngine {
	const [ , aBig ] = intAndBigFrom(options.a ?? 0x5DEECE66D);
	const [ , cBig ] = intAndBigFrom(options.c ?? 0xB);
	const [ , mBig ] = intAndBigFrom(options.m ?? (2n ** 31n));
	const [ , fBig ] = intAndBigFrom(options.floor ?? 16);
	const [ wInt, wBig ] = intAndBigFrom(options.width ?? 32);
	if (mBig !== 0n && ((aBig >= mBig) || (cBig >= mBig))) {
		throw new RangeError("Expected (a < m) && (c < m)");
	}
	let state = BigInt(options.seed ?? Date.now());
	const ceilBits = wBig + fBig;
	const mask = (BigInt(1) << ceilBits) - 1n;
	const next = (bits?: number): bigint => {
		const bb = BigInt(bits ?? wInt);
		state = (state * aBig + cBig) & mask;
		return (state >> (ceilBits - bb));
	};
	const maxBig = (2n ** wBig) - 1n;
	const maxInt = Number(maxBig);
	return Object.freeze(addProperty({ maxBig, maxInt, next }, "state", {
		get(): bigint {
			return state;
		},
	}));
}

/**
 * https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
export const randomNumberGenerator = (seedOrOptions?: number | RNGOptions, presetName?: LCEPresetName | undefined): RNG => {
	let preset: undefined | ((seed?: number | bigint | undefined) => RNGOptions);
	let seed: number | bigint = Date.now();
	let options = LCE_PRESETS.java(seed);
	let name = "custom";
	if (typeof seedOrOptions === "number") {
		seed = seedOrOptions;
	} else if (seedOrOptions != null) {
		options = { ...options, ...seedOrOptions };
		if (seedOrOptions.seed != null) {
			seed = seedOrOptions.seed;
		} else {
			options.seed = seed;
		}
	}
	if (presetName != null) {
		preset = LCE_PRESETS[presetName];
		if (preset == null) {
			throw new Error(`Unknown preset: ${presetName}`);
		}
		options = { ...preset(seed) };
		name = presetName;
	}
	const engine = linearCongruentialEngine(options);
	const { maxBig, maxInt } = engine;
	const floatDiv = maxInt + 1;
	const toInt = (big: bigint, max = maxBig): number => Number(big & max);
	const clone = () => randomNumberGenerator({ ...options, seed: engine.state });
	const bigInt: (bits?: number) => bigint = engine.next.bind(engine);
	const int = (): number => toInt(bigInt());
	const float01 = (): number => {
		return toInt(bigInt(), maxBig) / floatDiv;
	};
	const index = (length: number): number => {
		if (length <= 0) {
			throw new RangeError("length must be > 0");
		}
		const pow2 = Math.log2(length);
		if (pow2 === Math.trunc(pow2)) {
			return toInt((BigInt(length) * bigInt(31)) >> 31n);
		}
		const bigL = BigInt(length);
		let bits: bigint;
		let val: bigint;
		do {
			bits = bigInt(31);
			val = bits % bigL;
		} while ((bits - val + bigL - 1n) < 0n);
		return toInt(val);
	};
	const range = (low: number, high: number): number => {
		const width = high - low;
		return low + index(width);
	};
	const around = (radius: number, inclusive = false): number => {
		const sign = int() % 2 === 0 ? 1 : -1;
		const upper = radius + (inclusive ? 1 : 0);
		return sign * index(upper);
	};
	const gen = (supplier: (this: void) => number): ((count?: number | undefined) => Generator<number, undefined, undefined>) => {
		return function* randomGenerator(count = Infinity): Generator<number, undefined, undefined> {
			let n = 0;
			while (n < count) {
				yield supplier();
				n++;
			}
		};
	};
	const ints = gen(int);
	const ranges = (low: number, high: number, count?: number | undefined) => gen(range.bind(undefined, low, high))(count);
	return { around, bigInt, clone, float01, index, int, ints, name, range, ranges };
};

export const LCE_PRESETS = {
	ansiC: (seed) => ({ a: 1103515245, c: 12345, m: 2 ** 31, seed, width: 30 }),
	borlandC: (seed) => ({ a: 22695477, c: 1, m: 2 ** 31, seed, width: 31 }),
	c88: (seed) => ({ a: 16807, c: 0, m: 0x7FFFFFFF, seed }),
	c93: (seed) => ({ a: 48271, c: 0, m: 0x7FFFFFFF, seed }),
	delphi: (seed) => ({ a: 0x8088405, c: 1, m: 2 ** 32, seed, width: 32 }),
	glibc: (seed) => ({ a: 1103515245, c: 12345, m: 2 ** 31, seed, width: 31 }),
	java: (seed: number | bigint | undefined = Date.now()): RNGOptions => {
		// https://github.com/openjdk-mirror/jdk7u-jdk/blob/master/src/share/classes/java/util/Random.java#L131
		const scrambled = BigInt(seed) ^ 0x5DEECE66Dn;
		return { a: 0x5DEECE66Dn, c: 0xB, m: 2 ** 48, width: 32, floor: 16, seed: scrambled };
	},
	knuth: (seed) => ({ a: 0x5851F42D4C957F2Dn, c: 1, m: 2n ** 64n, seed, width: 64 }),
	visualC: (seed) => ({ a: 0x343FD, c: 0x269EC3, m: 2 ** 31, floor: 15, seed, width: 15 }),
} satisfies Record<string, (seed?: bigint | number | undefined) => RNGOptions>;

export type LCEPresetName = keyof typeof LCE_PRESETS;

export const LCE_PRESET_NAMES = Object.keys(LCE_PRESETS) as LCEPresetName[];
