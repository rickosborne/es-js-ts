import { toBatches } from "@rickosborne/foundation";
import { hasOwn, isJSONArray, isJSONSerializable, validateJSONArray, ValidationError } from "@rickosborne/guard";
import type { JSONArray, JSONSerializable } from "@rickosborne/typical";
import { assertLanguage } from "./assert-language.js";
import { assignThenContinue } from "./assign-then-continue.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { evaluateJSONata } from "./evaluate-jsonata.js";
import { evaluateJSONPath } from "./evaluate-jsonpath.js";
import { arrayAssertion, positiveIntAssertion } from "./evaluation-assertion.js";
import { getLanguage } from "./get-language.js";
import { getMaxConcurrency } from "./get-max-concurrency.js";
import { getToleratedFailureCount } from "./get-tolerated-failure-count.js";
import { processArgs } from "./process-args.js";
import { resourceHandlerResolver } from "./resource-handler-resolver.js";
import { runLocal } from "./run-local.js";
import type { RunStateContext } from "./run-types.js";
import { type ErrorOutput, errorOutputFromError, isJSONataItemBatcher, isJSONataItemReader, isJSONataString, isJSONPathItemBatcher, isJSONPathItemReader, isJSONPathPath, isJSONPathPayloadTemplate, JSONATA, JSONPATH, type MapState, STATES_BRANCH_FAILED, STATES_EXCEED_TOLERATED_FAILURE_THRESHOLD, STATES_RESULT_WRITER_FAILED } from "./sfn-types.js";

/**
 * Run the given Map State.
 */
export const runMap = async (
	context: RunStateContext<MapState>,
): Promise<JSONSerializable> => {
	const { options, state, stateName, stateStack } = context;
	const language = getLanguage(context);
	const { ItemProcessor: itemProcessor, ItemReader: itemReader, ItemSelector: itemSelector, ItemBatcher: itemBatcher, ResultWriter: resultWriter } = state;
	const items = hasOwn(state, "Items") ? state.Items : undefined;
	const itemsPath = hasOwn(state, "ItemsPath") ? state.ItemsPath : undefined;
	const present = [ "Items", "ItemsPath", "ItemReader" ].filter((k) => k in state && state[ k as keyof MapState ] != null);
	const args = await processArgs(context);
	if (present.length > 1) {
		throw new SyntaxError(`Map state ${ stateName } cannot combine: ${ present.join(" ") }`);
	}
	let inputList: JSONArray;
	if (isJSONataString(items)) {
		assertLanguage(language, JSONATA, "Items");
		inputList = await evaluateJSONata(items, { input: args, state }, arrayAssertion("Items", stateName));
	} else if (items != null) {
		if (!isJSONArray(items)) {
			throw new SyntaxError(`Map state ${ stateName } Items must be an array or a JSONata expression`);
		}
		inputList = items;
	} else if (itemsPath != null) {
		assertLanguage(language, JSONPATH, "ItemsPath");
		if (!isJSONPathPath(itemsPath)) {
			throw new SyntaxError(`Map state ${ stateName } ItemsPath must be a JSONPath expression`);
		}
		inputList = evaluateJSONPath(itemsPath, { input: args, options: context.options }, arrayAssertion("ItemsPath", stateName));
	} else if (itemReader != null) {
		let resource = itemReader.Resource;
		let readerInput: JSONSerializable;
		let maxItems: number | undefined;
		if (language === JSONATA && isJSONataItemReader(itemReader)) {
			readerInput = isJSONataString(itemReader.Arguments) ? await evaluateJSONata(itemReader.Arguments, { input: args, state }) : (itemReader.Arguments ?? null);
			const { ReaderConfig: readerConfig } = itemReader;
			maxItems = readerConfig?.MaxItems == null ? undefined : typeof readerConfig.MaxItems === "number" ? readerConfig.MaxItems : await evaluateJSONata(readerConfig.MaxItems, { input: args, state }, positiveIntAssertion("MaxItems", stateName));
		} else if (language === JSONPATH && isJSONPathItemReader(itemReader)) {
			const { ReaderConfig: readerConfig } = itemReader;
			readerInput = isJSONPathPayloadTemplate(itemReader.Parameters) ? await evaluateExpression(itemReader.Parameters, { input: args, language, options, state, stateStack }) : null;
			if (typeof readerConfig?.MaxItems === "number") {
				maxItems = readerConfig.MaxItems;
			} else if (isJSONPathPath(readerConfig?.MaxItemsPath)) {
				maxItems = evaluateJSONPath(readerConfig.MaxItemsPath, { input: args, options }, positiveIntAssertion("MaxItemsPath", stateName));
			}
		} else {
			throw new SyntaxError(`Map state ${ stateName } ItemReader for ${ language } is misconfigured.`);
		}
		/**
		 * The ItemReader Configuration causes the interpreter to read items from the task identified by the ItemReader’s "Resource" field.
		 */
		const fn = resourceHandlerResolver(options)(resource);
		const readerItems = fn.call(undefined, readerInput);
		const problems = validateJSONArray(readerItems);
		if (problems.length > 0) {
			throw new ValidationError(problems, { message: `Map state ${ stateName } InputReader did not return a JSON Array.` });
		}
		inputList = readerItems as JSONArray;
		if (maxItems != null && inputList.length > maxItems) {
			inputList.splice(maxItems, inputList.length - maxItems);
		}
	} else if (Array.isArray(args)) {
		/**
		 * If a Map State has neither an "ItemReader" nor an "Items" field, the items array will be the state input, which MUST be a JSON array.
		 */
		inputList = args;
	} else {
		inputList = [ args ];
	}
	/**
	 * If present, the interpreter uses the "ItemSelector" field to override each single element of the Items Array to produce an array of selected items.
	 * The interpreter uses the "ItemSelector" field to override each single element of the item array. The result of the "ItemSelector" field is called the selected item.
	 */
	if (itemSelector != null) {
		inputList = await Promise.all(inputList.map((item, index) => evaluateExpression(itemSelector, { contextObject: { Map: { Item: { Index: index, Value: item } } }, input: args, language, options, state, stateStack })));
	}
	/**
	 * If present, the interpreter then uses the "ItemBatcher" field to specify how to batch the selected items array to produce an array of batched selected items.
	 * The ItemBatcher Configuration causes the interpreter to batch selected items into sub-arrays before passing them to each invocation.
	 * ... the interpreter will not batch items if no "ItemBatcher" field is provided.
	 */
	if (itemBatcher != null) {
		let batchInput: JSONSerializable | undefined = itemBatcher.BatchInput;
		let maxItemsPerBatch: number | undefined;
		let maxInputBytesPerBatch: number | undefined;
		if (language === JSONATA && isJSONataItemBatcher(itemBatcher)) {
			maxItemsPerBatch = isJSONataString(itemBatcher.MaxItemsPerBatch) ? await evaluateJSONata(itemBatcher.MaxItemsPerBatch, { input: args, state }, positiveIntAssertion("MaxItemsPerBatch", stateName)) : itemBatcher.MaxItemsPerBatch;
			maxInputBytesPerBatch = isJSONataString(itemBatcher.MaxInputBytesPerBatch) ? await evaluateJSONata(itemBatcher.MaxInputBytesPerBatch, { input: args, state }, positiveIntAssertion("MaxInputBytesPerBatch", stateName)) : itemBatcher.MaxInputBytesPerBatch;
		} else if (language === JSONPATH && isJSONPathItemBatcher(itemBatcher)) {
			maxItemsPerBatch = itemBatcher.MaxItemsPerBatchPath != null ? evaluateJSONPath(itemBatcher.MaxItemsPerBatchPath, { input: args, options }, positiveIntAssertion("MaxItemsPerBatchPath", stateName)) : itemBatcher.MaxItemsPerBatch;
			maxInputBytesPerBatch = itemBatcher.MaxInputBytesPerBatchPath != null ? evaluateJSONPath(itemBatcher.MaxInputBytesPerBatchPath, { input: args, options }, positiveIntAssertion("MaxInputBytesPerBatch", stateName)) : itemBatcher.MaxInputBytesPerBatch;
		} else {
			throw new SyntaxError(`Map state ${ stateName } ItemBatcher is misconfigured`);
		}
		if (maxItemsPerBatch != null) {
			inputList = toBatches(maxItemsPerBatch, inputList);
		} else if (maxInputBytesPerBatch != null) {
			if (options.onMaxInputBytesPerBatch == null) {
				throw new Error(`Map state ${ stateName } uses MaxInputBytesPerBatch, which requires an onMaxInputBytesPerBatch handler`);
			}
			inputList = options.onMaxInputBytesPerBatch(inputList, maxInputBytesPerBatch, stateName);
		}
		if (batchInput != null) {
			inputList = await Promise.all(inputList.map((item, index) => evaluateExpression(batchInput, { contextObject: { Map: { Item: { Index: index, Value: item } } }, input: args, language, options, state, stateStack })));
		}
	}
	const maxConcurrency = await getMaxConcurrency({ ...context, assertionBuilder: positiveIntAssertion, language });
	const toleratedFailureCount = await getToleratedFailureCount({ ...context, assertionBuilder: positiveIntAssertion, itemCount: inputList.length, language });
	const outputs: JSONArray = [];
	const inputs = inputList.map((inputValue, index) => ({ inputValue, index }));
	let failureCount = 0;
	while (inputs.length > 0) {
		const batchSize = maxConcurrency === 0 ? inputs.length : maxConcurrency;
		// This isn't the cleverest promise pool implementation, but it'll work.
		const batch = inputs.slice(0, batchSize);
		const done = await Promise.all(batch.map(async ({ inputValue, index }) => {
			let errorOutput: ErrorOutput | undefined;
			const result = await runLocal(itemProcessor, {
				...options,
				input: inputValue,
				language,
			}).catch((err: unknown) => {
				errorOutput = err instanceof Error ? errorOutputFromError(err) : {
					Cause: String(err),
					Error: STATES_BRANCH_FAILED,
				};
				return null;
			});
			return {
				errorOutput,
				index,
				result,
			};
		}));
		for await (const { errorOutput, index, result } of done) {
			if (errorOutput != null) {
				failureCount++;
				if (failureCount > toleratedFailureCount) {
					/**
					 * If any iteration fails, due to an unhandled error or by transitioning to a Fail state,
					 * the entire Map State is considered to have failed and all the iterations are terminated.
					 * If the error is not handled by the Map State, the interpreter should terminate the machine
					 * execution with an error.
					 */
					return assignThenContinue({ ...context, errorOutput: { Cause: `${ errorOutput.Error } in #${ index }`, Error: STATES_EXCEED_TOLERATED_FAILURE_THRESHOLD }, output: null });
				}
			} else {
				outputs[ index ] = result;
				const inputsIndex = inputs.findIndex((v) => v.index === index);
				if (inputsIndex < 0) {
					throw new Error(`Map state ${ stateName } lost track of input #${ index }`);
				}
				inputs.splice(inputsIndex, 1);
			}
		}
	}
	let output: JSONSerializable = outputs;
	let errorOutput: ErrorOutput | undefined;
	/**
	 * @see {@link https://states-language.net/#writing-results | Writing Results}
	 */
	if (resultWriter != null) {
		const writerInputs = await Promise.all(outputs.map((out) => processArgs({ ...context, input: out }, resultWriter)));
		const fn = resourceHandlerResolver(options)(resultWriter.Resource);
		const causes: string[] = [];
		output = await Promise.all(writerInputs.map(async (writeInput, index) => {
			return (async () => await fn(writeInput))().then((value) => {
				if (isJSONSerializable(value)) return value;
				causes.push(`ResultWriter[${ index }] returned non-serializable ${ typeof value }`);
				return null;
			}).catch((err) => {
				const message = err instanceof Error ? `${ err.name }: ${ err.message }` : String(err);
				causes.push(`ResultWriter[${ index }] threw ${ message }`);
				return null;
			});
		}));
		if (causes.length > 0) {
			errorOutput = { Cause: causes.join("; "), Error: STATES_RESULT_WRITER_FAILED };
		}
	}
	return assignThenContinue({ ...context, errorOutput, output });
};
