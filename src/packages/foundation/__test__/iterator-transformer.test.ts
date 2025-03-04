import { expect } from "chai";
import { describe, test } from "mocha";
import type { IteratorTransformerBase, IteratorTransformerMapResult } from "../iterator-transformer.js";
import { asyncIteratorTransformer, iteratorTransformer } from "../iterator-transformer.js";
import { asyncIteratorOf, iteratorOf } from "../iterator.js";

describe("iterator transformers", () => {
	const transformers: (<T, U>(
		map: (inputs: T[], inputIsDone: boolean) => IteratorTransformerMapResult<U>,
		inputs: T[],
	) => Promise<({ transformer: IteratorTransformerBase<T, U>, outputs: U[] })>)[] = [
		function testIteratorTransformer<T, U>(
			map: (inputs: T[], inputIsDone: boolean) => IteratorTransformerMapResult<U>,
			inputs: T[],
		) {
			const builder = iteratorTransformer(map);
			const transformer = builder(iteratorOf(inputs));
			const outputs = Array.from(transformer);
			return Promise.resolve({
				transformer,
				outputs,
			});
		},
		async function testAsyncIteratorTransformer<T, U>(
			map: (inputs: T[], inputIsDone: boolean) => IteratorTransformerMapResult<U>,
			inputs: T[],
		) {
			const builder = asyncIteratorTransformer((inputs: T[], inputIsDone: boolean) => Promise.resolve(map(inputs, inputIsDone)));
			const transformer = builder(asyncIteratorOf(inputs));
			const outputs = await Array.fromAsync(transformer);
			return {
				transformer,
				outputs,
			};
		},
		async function testProactiveAsyncIteratorTransformer<T, U>(
			map: (inputs: T[], inputIsDone: boolean) => IteratorTransformerMapResult<U>,
			inputs: T[],
		) {
			const builder = asyncIteratorTransformer((inputs: T[], inputIsDone: boolean) => Promise.resolve(map(inputs, inputIsDone)), { proactive: true });
			const transformer = builder(asyncIteratorOf(inputs));
			const outputs = await Array.fromAsync(transformer);
			return {
				transformer,
				outputs,
			};
		},
	];

	for (const tester of transformers) {
		describe(tester.name.replace("test", ""), () => {
			test("narrowing/filtering", async () => {
				const originalInputs = [ "abc", 123, true, undefined, 456, null, 789 ];
				const inputBatches: unknown[][] = [];
				const map = <T>(inputs: T[]) => {
					inputBatches.push(inputs.slice());
					return {
						inputsProcessed: inputs.length,
						outputs: inputs.filter((i) => typeof i === "number"),
					};
				};
				const { transformer, outputs } = await tester(map, originalInputs);
				expect(outputs).eql([ 123, 456, 789 ]);
				expect(transformer.inputIsDone, "inputIsDone").eq(true);
				expect(transformer.outputIsDone, "outputIsDone").eq(true);
				expect(transformer.inputCount, "inputCount").eq(7);
				expect(transformer.outputCount, "outputCount").eq(3);
				expect(transformer.maxOutputsLength, "maxQueueLength").eq(1);
			});
			test("more + always returns one", async () => {
				const inputs = [ "a", "b", "c", "d", "e" ];
				const inputBatches: unknown[][] = [];
				const map = <T>(inputs: T[], inputDone: boolean) => {
					inputBatches.push(inputs.slice());
					let inputsProcessed = 0;
					const outputs: [ T, T | undefined ][] = [];
					for (let i = 1; i < inputs.length; i += 2) {
						inputsProcessed += 2;
						outputs.push([ inputs[ i - 1 ]!, inputs[ i ]! ]);
					}
					if (inputDone && inputsProcessed < inputs.length) {
						outputs.push([ inputs[inputsProcessed]!, undefined ]);
						inputsProcessed++;
					}
					return { inputsProcessed, outputs };
				};
				const { transformer, outputs } = await tester(map, inputs);
				expect(outputs).eql([ [ "a", "b" ], [ "c", "d" ], [ "e", undefined ] ]);
				expect(transformer.inputIsDone, "inputIsDone").eq(true);
				expect(transformer.outputIsDone, "outputIsDone").eq(true);
				expect(transformer.inputCount, "inputCount").eq(5);
				expect(transformer.outputCount, "outputCount").eq(3);
				expect(transformer.maxOutputsLength, "maxQueueLength").eq(1);
			});
			test("more may return multiple", async () => {
				const inputs = [ "a", "b", "c", "d", "e" ];
				const map = <T>(inputs: T[], inputIsDone: boolean): IteratorTransformerMapResult<T> => {
					if (inputs.length === 0 || (inputs.length === 1 && !inputIsDone)) {
						return { inputsProcessed: 0, outputs: [] };
					}
					if (inputs.length === 1) {
						return { inputsProcessed: 1, outputs: [ inputs[ 0 ]! ] };
					}
					return { inputsProcessed: 2, outputs: [ inputs[ 1 ]!, inputs[ 0 ]! ] };
				};
				const { outputs, transformer } = await tester(map, inputs);
				expect(outputs).eql([ "b", "a", "d", "c", "e" ]);
				expect(transformer.inputIsDone, "inputIsDone").eq(true);
				expect(transformer.outputIsDone, "outputIsDone").eq(true);
				expect(transformer.inputCount, "inputCount").eq(5);
				expect(transformer.outputCount, "outputCount").eq(5);
				expect(transformer.maxOutputsLength, "maxQueueLength").eq(2);
			});
		});
	}
});
