/**
 * List of metric prefixes, where the index is its base-1000
 * or base-1024 offset.
 */
export const METRIC_PREFIXES = Object.freeze([
	"", "K", "M", "G", "T", "P", "E", "Z", "Y", "R", "Q",
]);

/**
 * Polyfill for bigint logarithm math.
 */
const magnitudeOfBigInt = (num: bigint, base: number): number => {
	let n = num;
	let mag = 0;
	const b: bigint = BigInt(base);
	while (n >= b) {
		mag++;
		n /= b;
	}
	return mag;
};

/**
 * Polyfill for bigint <kbd>**</kbd> exponentiation.
 */
const bigIntDivisorForMetric = (magnitude: number, base: number): bigint => {
	let n = BigInt(1);
	const b = BigInt(base);
	for (let i = 0; i < magnitude; i++) {
		n *= b;
	}
	return n;
};

/**
 * Pretty-print a byte value with low enough detail to be quickly
 * human-readable.
 */
export const formatBytes = (
	bytes: number | bigint,
	base: 1024 | 1000 = 1024,
	precision = 3,
): string => {
	const sign = bytes < 0 ? "-" : "";
	let index: number;
	let round: string;
	if (typeof bytes === "number") {
		const abs = Math.abs(bytes);
		if (abs < base) return `${bytes}B`;
		const magnitude = Math.floor(Math.log(abs) / Math.log(base));
		index = Math.min(magnitude, METRIC_PREFIXES.length - 1);
		round = (abs / (base ** index)).toPrecision(precision);
	} else {
		const abs = bytes < 0 ? -bytes : bytes;
		if (abs < base) return `${bytes}B`;
		const magnitude = magnitudeOfBigInt(abs, base);
		index = Math.min(magnitude, METRIC_PREFIXES.length - 1);
		const div = bigIntDivisorForMetric(index, base);
		round = (abs / div).toString(10);
	}
	const suffix = base === 1024 ? "iB" : "B";
	const prefix = METRIC_PREFIXES[ index ];
	return `${ sign }${ round }${ prefix }${ suffix }`;
};
