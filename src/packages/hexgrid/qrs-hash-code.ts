import { memoizeSupplier } from "@rickosborne/foundation";
import type { BareQRSPoint } from "./qrs.js";

const buffer64 = memoizeSupplier(() => Buffer.allocUnsafe(8));

const toBits32 = (num: number, buf = buffer64(), offset = 0) => {
	if (Number.isSafeInteger(num)) {
		buf.writeInt32BE(num, offset);
	} else {
		buf.writeFloatBE(num, offset);
	}
	return buf.readUInt32BE(offset);
};

/**
 * Generate a (very simplistic) hash code for a hex point which could
 * be used as a Map/Hash key.
 */
export const qrsHashCode = ({ q, r }: BareQRSPoint): bigint => {
	const buf = buffer64();
	toBits32(q, buf, 0);
	toBits32(r, buf, 4);
	return buf.readBigUint64LE();
};
