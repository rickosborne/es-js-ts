/**
 * Build a DataView from a hex-encoded string.  This is a polyfill
 * for `Uint8Array.fromHex()`.
 */
export const dataViewFromHex = (hex: string): DataView => {
	const h = hex.length % 2 ? "0".concat(hex) : hex;
	const count = h.length / 2;
	const dataView = new DataView(new ArrayBuffer(count));
	for (let i = 0; i < count; i++) {
		dataView.setUint8(i, Number.parseInt(h.substring(i * 2, (i + 1) * 2), 16));
	}
	return dataView;
};
