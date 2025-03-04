import { isAsyncIterableLike, isIterableLike } from "@rickosborne/guard";
import { asyncIteratorOf, iteratorOf } from "./iterator.js";

const isArrayLike = <T>(value: unknown): value is ArrayLike<T> => Array.isArray(value);

/**
 * Polyfill for `Array.fromAsync` for node before v22.
 */
export const arrayFromAsync = async <T>(
	iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>,
): Promise<T[]> => {
	const values: T[] = [];
	if (isArrayLike<T | PromiseLike<T>>(iterableOrArrayLike)) {
		// noinspection UnnecessaryLocalVariableJS
		const list: ArrayLike<T | PromiseLike<T>> = iterableOrArrayLike;
		for (let i = 0; i < iterableOrArrayLike.length; i++) {
			values.push(await list[ i ]!);
		}
	} else {
		let it: Iterator<T | PromiseLike<T>, undefined, undefined> | AsyncIterator<T, undefined, undefined>;
		if (isAsyncIterableLike(iterableOrArrayLike)) {
			it = asyncIteratorOf(iterableOrArrayLike);
		} else if (isIterableLike(iterableOrArrayLike)) {
			it = iteratorOf(iterableOrArrayLike);
		} else {
			throw new Error("");
		}
		let more = true;
		do {
			const result = await it.next();
			if (result.done) {
				more = false;
			} else {
				values.push(await result.value);
			}
		} while (more);
	}
	return values;
};
