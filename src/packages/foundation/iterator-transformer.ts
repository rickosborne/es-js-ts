import type { AbstractConstructorLike } from "@rickosborne/typical";
import { catchAnd } from "./catch-and.js";
import { asyncIteratorOf, iteratorOf } from "./iterator.js";

export type Optional<T> = { value: T } | undefined;

export type IteratorTransformerMore<T> = () => Optional<T>;

/**
 * Basic queues and statistic tracking for a dual-queued Iterator transformer.
 */
export abstract class IteratorTransformerBase<InputT, OutputT> {
	private _inputCount = 0;
	private _inputDone = false;
	private _maxInputsLength = 0;
	private _maxOutputsLength = 0;
	private _outputCount = 0;
	private _outputDone = false;
	private readonly inputQueue: InputT[] = [];
	private readonly outputQueue: OutputT[] = [];

	public get inputCount(): number {
		return this._inputCount;
	}

	public get inputIsDone(): boolean {
		return this._inputDone;
	}

	public get inputQueueLength(): number {
		return this.inputQueue.length;
	}

	protected get inputs(): InputT[] {
		return this.inputQueue;
	}

	public get maxInputsLength(): number {
		return this._maxInputsLength;
	}

	public get maxOutputsLength(): number {
		return this._maxOutputsLength;
	}

	public get outputCount(): number {
		return this._outputCount;
	}

	public get outputIsDone(): boolean {
		return this._outputDone;
	}

	public get outputQueueLength(): number {
		return this.outputQueue.length;
	}

	protected pushInput(input: InputT): void {
		this._inputCount++;
		this.inputQueue.push(input);
		const length = this.inputQueue.length;
		if (length > this._maxInputsLength) {
			this._maxInputsLength = length;
		}
	}

	protected pushOutputs(items: OutputT[]): void {
		this._outputCount += items.length;
		items.forEach((item) => this.outputQueue.push(item));
		const length = this.outputQueue.length;
		if (length > this._maxOutputsLength) {
			this._maxOutputsLength = length;
		}
	}

	protected setInputDone(): void {
		this._inputDone = true;
	}

	protected setOutputDone(): void {
		this._outputDone = true;
	}

	protected takeInputs(count: number): InputT[] {
		if (this.inputQueue.length < count) {
			throw new Error(`Cannot consume ${ count } > ${ this.inputQueue.length } inputs`);
		}
		return this.inputQueue.splice(0, count);
	}

	protected takeOutput(): Optional<OutputT> {
		if (this.outputQueue.length === 0) {
			return undefined;
		}
		return { value: this.outputQueue.shift()! };
	}
}

export type SyncIteratorTransformerConstructor<InputT, OutputT> = AbstractConstructorLike<[ iterator: Iterator<InputT, undefined, undefined> ], IteratorTransformer<InputT, OutputT>>;

export interface IteratorTransformerMapResult<OutputT> {
	inputsProcessed: number;
	outputs: OutputT[];
}

export abstract class IteratorTransformer<InputT, OutputT> extends IteratorTransformerBase<InputT, OutputT> implements IterableIterator<OutputT, undefined, undefined> {
	private readonly inputIterator: Iterator<InputT, undefined, undefined>;

	public constructor(iterator: Iterator<InputT, undefined, undefined>) {
		super();
		this.inputIterator = iterator;
	}

	protected abstract map(inputs: readonly InputT[], inputDone: boolean): IteratorTransformerMapResult<OutputT>;

	public next(): IteratorResult<OutputT, undefined> {
		let more = true;
		do {
			const output = this.takeOutput();
			if (output != null) {
				return { done: false, value: output.value };
			}
			const anyInput = this.nextInput();
			if (anyInput || this.inputQueueLength > 0) {
				const { inputsProcessed, outputs } = this.map(this.inputs, !anyInput);
				if (outputs.length > 0) {
					this.pushOutputs(outputs);
				}
				if (inputsProcessed > 0) {
					this.takeInputs(inputsProcessed);
				}
				if (!anyInput && this.inputQueueLength > 0) {
					throw new Error("Inputs in queue after final map operation");
				}
			}
			if (this.inputIsDone && this.inputQueueLength == 0 && this.outputQueueLength === 0) {
				this.setOutputDone();
				more = false;
			}
		} while (more);
		return { done: true, value: undefined };
	}

	private nextInput(): boolean {
		if (this.inputIsDone) {
			return false;
		}
		const inputResult = this.inputIterator.next();
		if (inputResult.done) {
			this.setInputDone();
			return false;
		}
		this.pushInput(inputResult.value);
		return true;
	}

	public [ Symbol.iterator ](): IterableIterator<OutputT, undefined, undefined> {
		return this;
	}
}

export const iteratorTransformer = <InputT, OutputT>(
	map: (inputs: InputT[], inputIsDone: boolean) => IteratorTransformerMapResult<OutputT>,
): (
	it: Iterator<InputT, undefined, undefined> | Iterable<InputT, undefined, undefined>,
) => IteratorTransformer<InputT, OutputT> => {
	return (
		it: Iterator<InputT, undefined, undefined> | Iterable<InputT, undefined, undefined>,
	) => {
		return new (class extends IteratorTransformer<InputT, OutputT> {
			protected map(inputs: InputT[], inputIsDone: boolean): IteratorTransformerMapResult<OutputT> {
				return map(inputs, inputIsDone);
			}
		})(iteratorOf(it));
	};
};

export type AsyncIteratorTransformerConstructor<InputT, OutputT> = AbstractConstructorLike<[ iterator: AsyncIterator<InputT, undefined, undefined> ], AsyncIteratorTransformer<InputT, OutputT>>;

/**
 * Additional configuration for an asynchronous Iterator transformer.
 */
export interface AsyncIteratorTransformerOptions {
	/**
	 * If true, will call `next`, without blocking, on the Input Iterator as its
	 * own `next` sends out an Output.  In some cases, this could improve latency between
	 * input and output calls.  In cases where there are more outputs than inputs,
	 * this could chew up memory.
	 */
	proactive?: boolean;
}

export abstract class AsyncIteratorTransformer<InputT, OutputT> extends IteratorTransformerBase<InputT, OutputT> implements AsyncIterableIterator<OutputT, undefined, undefined> {
	private readonly inputIterator: AsyncIterator<InputT, undefined, undefined>;
	private nextInputPromise: Promise<boolean> | undefined = undefined;
	private readonly proactive: boolean;

	public constructor(iterator: AsyncIterator<InputT, undefined, undefined>, options: AsyncIteratorTransformerOptions = {}) {
		super();
		this.inputIterator = iterator;
		this.proactive = options.proactive ?? false;
	}

	protected abstract map(inputs: InputT[], inputDone: boolean): IteratorTransformerMapResult<OutputT> | Promise<IteratorTransformerMapResult<OutputT>>;

	public async next(): Promise<IteratorResult<OutputT, undefined>> {
		let result: IteratorResult<OutputT, undefined> | undefined = undefined;
		let more = true;
		do {
			const output = this.takeOutput();
			if (output != null) {
				result = { done: false, value: output.value };
				break;
			}
			const anyInput = await this.nextInput();
			if (anyInput || this.inputQueueLength > 0) {
				const { inputsProcessed, outputs } = await this.map(this.inputs, !anyInput);
				if (outputs.length > 0) {
					this.pushOutputs(outputs);
				}
				if (inputsProcessed > 0) {
					this.takeInputs(inputsProcessed);
				}
				if (!anyInput && this.inputQueueLength > 0) {
					throw new Error("Inputs in queue after final map operation");
				}
			}
			if (this.inputIsDone && this.inputQueueLength == 0 && this.outputQueueLength === 0) {
				this.setOutputDone();
				more = false;
			}
		} while (more);
		result ??= { done: true, value: undefined };
		if (this.proactive && !this.inputIsDone) {
			this.nextInput().catch(catchAnd({ rethrow: true }));
		}
		return result;
	}

	private async nextInput(): Promise<boolean> {
		if (this.inputIsDone) {
			return false;
		}
		if (this.nextInputPromise != null) {
			return this.nextInputPromise;
		}
		this.nextInputPromise = this.inputIterator.next().then((inputResult) => {
			this.nextInputPromise = undefined;
			if (inputResult.done) {
				this.setInputDone();
				return false;
			}
			this.pushInput(inputResult.value);
			return true;
		});
		return await this.nextInputPromise;
	}

	public [ Symbol.asyncIterator ](): AsyncIterableIterator<OutputT, undefined, undefined> {
		return this;
	}
}


export const asyncIteratorTransformer = <InputT, OutputT>(
	map: (inputs: InputT[], inputIsDone: boolean) => IteratorTransformerMapResult<OutputT> | Promise<IteratorTransformerMapResult<OutputT>>,
	options?: AsyncIteratorTransformerOptions,
): (
	it: AsyncIterator<InputT, undefined, undefined> | AsyncIterable<InputT, undefined, undefined> | Iterable<InputT, undefined, undefined>,
) => AsyncIteratorTransformer<InputT, OutputT> => {
	return (
		it: AsyncIterator<InputT, undefined, undefined> | AsyncIterable<InputT, undefined, undefined> | Iterable<InputT, undefined, undefined>,
	): AsyncIteratorTransformer<InputT, OutputT> => {
		return new (class extends AsyncIteratorTransformer<InputT, OutputT> {
			protected map(inputs: InputT[], inputIsDone: boolean): IteratorTransformerMapResult<OutputT> | Promise<IteratorTransformerMapResult<OutputT>> {
				return map(inputs, inputIsDone);
			}
		})(asyncIteratorOf(it), options);
	};
};

export type IteratorTransformerConstructor<InputT, OutputT> = SyncIteratorTransformerConstructor<InputT, OutputT> | AsyncIteratorTransformerConstructor<InputT, OutputT>;
