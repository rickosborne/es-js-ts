/**
 * Error which will be thrown if a timeout happens and no other
 * error is provided.
 */
export class TimeoutError extends Error {
	public override readonly name = "TimeoutError";
}

/**
 * Options for {@link withTimeout}.
 */
export interface WithTimeoutOptions<T> {
	block: Promise<T> | (() => Promise<T>);
	/**
	 * If the timeout happens, generate the error which will be thrown.
	 */
	onThrow?: () => Error;
	/**
	 * If the timeout happens, generate a value which will be used
	 * to resolve the promise instead of throwing an error.
	 */
	onTimeout?: undefined | T | (() => T);
	/**
	 * Maximum time to wait for the original promise to resolve before
	 * giving up and forcing a resolution.
	 */
	timeoutMS: number;
}

/**
 * Wrap a given block or promise in another promise which will
 * resolve or reject if the first has not resolved within the
 * specified time limit.
 */
export function withTimeout<T>(options: WithTimeoutOptions<T>): Promise<T> {
	const { block, onThrow, onTimeout, timeoutMS } = options;
	return new Promise<T>((resolve, reject) => {
		let resolved = false;
		const complete = (value: T): void => {
			if (resolved) return;
			resolved = true;
			if (timer != null) {
				clearTimeout(timer);
				timer = undefined;
			}
			resolve(value);
		};
		let timer: undefined | ReturnType<typeof setTimeout> = setTimeout(() => {
			if (resolved) return;
			if (onTimeout == null) {
				resolved = true;
				reject(onThrow?.() ?? new TimeoutError());
				return;
			}
			let defaultValue: T;
			if (typeof onTimeout === "function") {
				defaultValue = (onTimeout as () => T)();
			} else {
				defaultValue = onTimeout;
			}
			complete(defaultValue);
		}, timeoutMS);
		let timed: Promise<T>;
		if (typeof block === "function") {
			timed = block();
		} else {
			timed = block;
		}
		timed.then(complete).catch(reject);
	});
}
