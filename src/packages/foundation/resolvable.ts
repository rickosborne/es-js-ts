import { type Holder, holder } from "./holder.js";

/**
 * A promise which can be resolved from the outside.
 */
export interface ResolvablePromise<T> extends Promise<T> {
	readonly isResolved: boolean;
	readonly isRejected: boolean;
	readonly isSettled: boolean;
	readonly promise: Promise<T>;
	reject(reason?: unknown): void;
	resolve(value: T): void;
}

/**
 * Build a promise which can be resolved from the outside.
 */
export function resolvablePromise<T>(): ResolvablePromise<T> {
	const rejectedHolder: Holder<unknown> = holder<unknown>();
	const resolvedHolder: Holder<T> = holder<T>();
	let doResolve: ((value: T) => void) | undefined;
	let doReject: ((reason?: unknown) => void) | undefined;
	const promise = new Promise<T>((resolve, reject) => {
		doResolve = resolve;
		doReject = reject;
		if (resolvedHolder.isPresent()) {
			resolve(resolvedHolder.value);
		} else if (rejectedHolder.isPresent()) {
			reject(rejectedHolder.value);
		}
	});
	return {
		get promise(): Promise<T> {
			return promise;
		},
		get isRejected(): boolean {
			return rejectedHolder.isPresent();
		},
		get isResolved(): boolean {
			return resolvedHolder.isPresent();
		},
		get isSettled(): boolean {
			return rejectedHolder.isPresent() || resolvedHolder.isPresent();
		},
		resolve(value: T): void {
			if (rejectedHolder.isPresent()) {
				throw new Error("Cannot resolve: already rejected");
			}
			if (resolvedHolder.isPresent()) {
				throw new Error("Cannot resolve: already resolved");
			}
			resolvedHolder.setValue(value);
			doResolve?.(value);
		},
		reject(reason?: unknown): void {
			if (rejectedHolder.isPresent()) {
				throw new Error("Cannot reject: already rejected");
			}
			if (resolvedHolder.isPresent()) {
				throw new Error("Cannot reject: already resolved");
			}
			rejectedHolder.setValue(reason);
			doReject?.(reason);
		},
		then: promise.then.bind(promise),
		"catch": promise.catch.bind(promise),
		"finally": promise.finally.bind(promise),
		[Symbol.toStringTag]: "ResolvablePromise",
	};
}
