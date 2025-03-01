/**
 * Convert a synchronous iterator into an asynhronous one.
 */
export const asyncIteratorFor = <TYield, TReturn, TNext>(iterator: Iterator<TYield, TReturn, TNext>): AsyncIterator<TYield, TReturn, TNext> => {
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
