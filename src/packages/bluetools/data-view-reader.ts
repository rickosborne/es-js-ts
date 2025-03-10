export class DataViewReader {
	public static forDataView(dataView: DataView | DataViewReader, startAt?: number | undefined): DataViewReader {
		if (dataView instanceof DataViewReader) {
			return dataView;
		}
		return new DataViewReader(dataView, startAt);
	}

	private readonly dataView: DataView;
	private index: number;
	private nibbleRemainder: number | undefined = undefined;

	protected constructor(dataView: DataView, startAt: number = 0) {
		this.dataView = dataView;
		this.index = startAt;
	}

	public bool(): boolean {
		// Thoughts and prayers
		return this.uint8() !== 0;
	}

	public get byteLength(): number {
		return this.dataView.byteLength;
	}

	public get bytesRemain(): number {
		return this.dataView.byteLength - this.index;
	}

	public float16(): number {
		/**
		 * These are short (16-bit) signed floats.
		 * {@link https://www.bluetooth.org/DocMan/handlers/DownloadDoc.ashx?doc_id=272346 | Personal Health Devices Transcoding Whitepaper}
		 */
		const u16 = this.uint16();
		if (u16 === 0x07FF || u16 === 0x0800 || u16 === 0x0801) return Number.NaN;
		if (u16 === 0x07FE) return Number.POSITIVE_INFINITY;
		if (u16 === 0x0802) return Number.NEGATIVE_INFINITY;
		const exponent = this.floatFromUint((u16 & 0xF000) >> 12, 4);
		const mantissa = this.floatFromUint(u16 & 0x0FFF, 12);
		return mantissa * Math.pow(10, exponent);
	}

	public float32(): number {
		/**
		 * These are 32-bit signed floats.
		 * The 32 bits contain an 8-bit signed exponent to base 10, followed by a 24-bit signed integer (mantissa).
		 * {@link https://www.bluetooth.org/DocMan/handlers/DownloadDoc.ashx?doc_id=272346 | Personal Health Devices Transcoding Whitepaper}
		 */
		const u32 = this.uint32();
		if (u32 === 0x007F_FFFF || u32 === 0x0080_0000 || u32 === 0x0080_0001) return Number.NaN;
		if (u32 === 0x007F_FFFE) return Number.POSITIVE_INFINITY;
		if (u32 === 0x0080_0002) return Number.NEGATIVE_INFINITY;
		const exponent = this.floatFromUint((u32 & 0xFF00_0000) >> 24, 8);
		const mantissa = this.floatFromUint(u32 & 0x00FF_FFFF, 24);
		return mantissa * Math.pow(10, exponent);
	}

	private floatFromUint(unsigned: number, bits: number): number {
		const signMask = 1 << (bits - 1);
		const sign = (unsigned & signMask) === 0 ? 1 : -1;
		let value = unsigned;
		if (sign < 0) {
			let valueMask = 1;
			for (let i = 0; i < bits - 2; i++) {
				valueMask = (valueMask << 1) + 1;
			}
			value = ((~value) & valueMask) + 1;
		}
		return value * sign;
	}

	public int16(): number {
		const num = this.dataView.getInt32(this.index);
		this.index += 2;
		return num;
	}

	public int24(): number {
		const unsigned = this.uint24();
		const isNegative = unsigned & 0x80_0000;
		if (isNegative) {
			return -1 * (0xFF_FFFF - unsigned + 1);
		}
		return unsigned;
	}

	public int32(): number {
		const num = this.dataView.getInt32(this.index);
		this.index += 4;
		return num;
	}

	public int8(): number {
		return this.dataView.getInt8(this.index++);
	}

	public nibble(): number {
		const remainder = this.nibbleRemainder;
		if (remainder != null) {
			this.nibbleRemainder = undefined;
			return remainder;
		}
		const byte = this.uint8();
		this.nibbleRemainder = byte & 0x0F;
		return (byte & 0xF0) >> 4;
	}

	public uint2(): number {
		throw new Error("Not implemented: uint2");
	}

	public uint12(): number {
		const byte = this.uint8();
		const nibble = this.nibble();
		return byte + (nibble << 8);
	}

	public uint16(): number {
		return this.uintCount(2);
	}

	public uint24(): number {
		return this.uintCount(3);
	}

	public uint32(): number {
		return this.uintCount(4);
	}

	public uint40(): number {
		return this.uintCount(5);
	}

	public uint48(): number {
		return this.uintCount(6);
	}

	public uint8(): number {
		return this.uintCount(1);
	}

	public uintCount(byteCount: number): number {
		let num = 0;
		let shift = 0;
		for (let i = 0; i < byteCount; i++) {
			const byte = this.dataView.getUint8(this.index) << shift;
			this.index++;
			shift += 8;
			num += byte;
		}
		return num;
	}

	public utf8s(): string {
		const chars: number[] = [];
		while (this.index < this.dataView.byteLength) {
			const char = this.dataView.getUint8(this.index);
			this.index++;
			if (char === 0) {
				break;
			}
			chars.push(char);
		}
		return String.fromCharCode(...chars);
	}
}

export const dataViewReader = (dataView: DataView | DataViewReader, indexStart = 0): DataViewReader => DataViewReader.forDataView(dataView, indexStart);
