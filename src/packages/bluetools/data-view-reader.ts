export interface DataViewReader {
	readonly byteLength: number;
	readonly bytesRemain: number;
	readonly index: number;

	float(): number;

	int16(): number;

	int24(): number;

	int32(): number;

	int8(): number;

	nibble(): number;

	sFloat(): number;

	uint16(): number;

	uint24(): number;

	uint32(): number;

	uint40(): number;

	uint8(): number;

	utf8s(): string;
}

export const isDataViewReader = (value: unknown): value is DataViewReader => value != null && typeof value === "object" && typeof Object.getOwnPropertyDescriptor(value, "bytesRemain")?.get === "function";

export const dataViewReader = (dataView: DataView | DataViewReader, indexStart = 0): DataViewReader => {
	if (isDataViewReader(dataView)) {
		return dataView;
	}
	let index = indexStart;
	return {
		get byteLength(): number {
			return dataView.byteLength;
		},
		get bytesRemain(): number {
			return dataView.byteLength - index;
		},
		get index(): number {
			return index;
		},
		int8(): number {
			const num = dataView.getInt8(index);
			index++;
			return num;
		},
		int16(): number {
			const num = dataView.getInt16(index, true);
			index += 2;
			return num;
		},
		int24(): number {
			const num = dataView.getInt32(index, true) >> 8;
			index += 3;
			return num;
		},
		int32(): number {
			const num = dataView.getInt32(index, true);
			index += 4;
			return num;
		},
		float(): number {
			const num = dataView.getFloat32(index, true);
			index += 4;
			return num;
		},
		nibble(): number {
			throw new Error("Not implemented: nibble format");
		},
		sFloat(): number {
			throw new Error("Not implemented: SFLOAT format");
		},
		uint8(): number {
			const num = dataView.getUint8(index);
			index += 1;
			return num;
		},
		uint16(): number {
			const num = dataView.getUint16(index, true);
			index += 2;
			return num;
		},
		uint24(): number {
			const num = dataView.getUint32(index, true) >> 8;
			index += 3;
			return num;
		},
		uint32(): number {
			const num = dataView.getUint32(index, true);
			index += 3;
			return num;
		},
		uint40(): number {
			const num = dataView.getUint32(index, true) << 8 + dataView.getUint8(index + 4);
			index += 5;
			return num;
		},
		utf8s(): string {
			const chars: number[] = [];
			while (index < dataView.byteLength) {
				const char = dataView.getUint8(index);
				index++;
				if (char === 0) {
					break;
				}
				chars.push(char);
			}
			return String.fromCharCode(...chars);
		},
	};
};
