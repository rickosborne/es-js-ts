/**
 * Sleep at least some number of ms, returning the supplied value
 * when complete.
 */
export function sleep<T>(ms: number, value: T): Promise<T>;
/**
 * Sleep at least some number of ms.
 */
export function sleep(ms: number): Promise<undefined>;
/**
 * Sleep at least some number of ms.
 */
export function sleep<T = undefined>(ms: number, value?: T | undefined): Promise<T> {
	return new Promise<T>((resolve) => {
		setTimeout(() => {
			resolve(value as T);
		}, ms);
	});
}
