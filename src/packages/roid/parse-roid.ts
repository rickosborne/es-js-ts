import { bigintFromBase56 } from "./bigint-from-base56.js";
import { ROID_LENGTH, ROID_MAX_MACHINE_ID, ROID_MAX_SEQUENCE_NUMBER, ROID_MAX_TIMESTAMP } from "./roid-options.js";

/**
 * The numbers embedded in a base56-encoded roid.
 */
export interface ParsedRoid {
	machineId: number;
	timestamp: number;
	sequenceNumber: number;
	uint64: bigint;
}

const SEQUENCE_NUMBER_MASK = BigInt(ROID_MAX_SEQUENCE_NUMBER);
const MACHINE_ID_MASK = BigInt(ROID_MAX_MACHINE_ID);
const TIMESTAMP_MASK = BigInt(ROID_MAX_TIMESTAMP);

/**
 * Parse a base56-encoded roid into its constituent numbers.
 * If errors are encountered, they are returned instead of thrown.
 */
export const safeParseRoid = (id: string): [error: SyntaxError, parsed: undefined] | [error: undefined, parsed: ParsedRoid] => {
	if (id.length !== ROID_LENGTH) {
		return [ new SyntaxError("Expected a roid length of 11"), undefined ];
	}
	const [ decodeError, uint64 ] = bigintFromBase56(id);
	if (decodeError != null) {
		return [ decodeError, undefined ];
	}
	const prefix = Number(uint64 >> 62n);
	if (prefix !== 1) {
		return [ new SyntaxError("Missing 01 roid prefix"), undefined ];
	}
	const sequenceNumber = Number(uint64 & SEQUENCE_NUMBER_MASK);
	const machineId = Number((uint64 >> 8n) & MACHINE_ID_MASK);
	const timestamp = Number((uint64 >> 20n) & TIMESTAMP_MASK);
	return [ undefined, { machineId, sequenceNumber, timestamp, uint64 } ];
};

/**
 * Parse a base56-encoded roid into its constituent numbers.
 * @throws SyntaxError
 */
export const parseRoid = (id: string): ParsedRoid => {
	const [ error, parsed ] = safeParseRoid(id);
	if (parsed != null) {
		return parsed;
	}
	throw error;
};
