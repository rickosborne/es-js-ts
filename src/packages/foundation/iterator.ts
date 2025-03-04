import { isAsyncIterableLike, isIterableLike, isIteratorLike } from "@rickosborne/guard";

/**
 * Convert a synchronous iterator into an asynchronous one.
 */
export const asyncIteratorFrom = <TYield, TReturn, TNext>(iterator: Iterator<TYield, TReturn, TNext>): AsyncIterator<TYield, TReturn, TNext> => {
	const itReturn = iterator.return == null ? undefined : iterator.return.bind(iterator);
	const itThrow = iterator.throw == null ? undefined : iterator.throw.bind(iterator);
	return {
		next(...args): Promise<IteratorResult<TYield, TReturn>> {
			return Promise.resolve(iterator.next(...args));
		},
		...(itReturn != null ? {
			async return(value?: PromiseLike<TReturn> | TReturn): Promise<IteratorResult<TYield, TReturn>> {
				return itReturn(await value);
			},
		} : {}),
		...(itThrow != null ? {
			throw(reason: unknown): Promise<IteratorResult<TYield, TReturn>> {
				return Promise.resolve(itThrow(reason));
			},
		} : {}),
	};
};

/**
 * If the value is already an Iterator, return it.
 * If the value is Iterable, return an Iterator for it.
 * Otherwise, throw an error.
 */
export const iteratorOf = <T>(
	it: Iterable<T, undefined, undefined> | Iterator<T, undefined, undefined>,
): Iterator<T, undefined, undefined> => {
	if (isIteratorLike<T>(it)) {
		return it;
	}
	if (isIterableLike(it)) {
		return it[ Symbol.iterator ]();
	}
	throw new Error("iteratorOf expects an Iterator or Iterable");
};

/**
 * If the value is already an Iterator, return it.
 * If the value is AsyncIterable, return an Iterator for it.
 * It the value is Iterable, upgrade an Iterator for it to an AsyncIterator
 * and return that.
 * Otherwise, throw an error.
 * @remarks
 * As the only difference between an Iterator and an AsyncIterator
 * is the return type of the `next` function, this function cannot
 * distinguish whether a given Iterator is an AsyncIterator or not.
 * If your calling code does not use `await` and instead uses `then`
 * directly, you may end up with errors.
 */
export const asyncIteratorOf = <T>(
	it: AsyncIterable<T, undefined, undefined> | Iterable<T, undefined, undefined> | AsyncIterator<T, undefined, undefined>,
): AsyncIterator<T, undefined, undefined> => {
	if (isIteratorLike<T>(it)) {
		return it;
	}
	if (isAsyncIterableLike(it)) {
		return it[ Symbol.asyncIterator ]();
	}
	if (isIterableLike(it)) {
		return asyncIteratorFrom(it[ Symbol.iterator ]());
	}
	throw new Error("iteratorOf expects an Iterator or Iterable");
};
