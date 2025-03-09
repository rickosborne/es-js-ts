import { dataViewFromHex } from "./data-view-from-hex.js";
import type { HeartRateMeasurement } from "./heart-rate-measurement.js";

/**
 * @see {@link https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.heart_rate_measurement.xml}
 * @see {@link https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js}
 */
export const parseHeartRate = (viewOrHex: DataView | string): HeartRateMeasurement => {
	const reading: DataView = typeof viewOrHex === "string" ? dataViewFromHex(viewOrHex) : viewOrHex;
	const flags = reading.getUint8(0);
	const rateBytes = !!(flags & 0b0000_0001) ? 2 : 1;
	let index = 1;
	const bpm = rateBytes === 1 ? reading.getUint8(index) : reading.getUint16(index, true);
	index += rateBytes;
	const sensorContact = (flags & 0b0000_0110) >> 1;
	const energyExpendedPresent = !!(flags & 0b0000_1000);
	let expendedJ: number | undefined;
	if (energyExpendedPresent) {
		expendedJ = reading.getUint16(index, true);
		index += 2;
	}
	const rrPresent = !!(flags & 0b0001_0000);
	let rrInterval: number[] | undefined;
	if (rrPresent) {
		rrInterval = [];
		for (; index + 1 < reading.byteLength; index += 2) {
			rrInterval.push(reading.getUint16(index, true));
		}
	}
	const reserved = flags & 0b1110_0000;
	return {
		bpm,
		flags,
		sensorContact,
		...(expendedJ == null ? {} : { expendedJ }),
		...(reserved === 0 ? {} : { reserved }),
		...(rrInterval == null ? {} : { rrInterval }),
	};
};
