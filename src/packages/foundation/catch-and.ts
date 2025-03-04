import type { Predicate } from "@rickosborne/typical";
import type { LogLike } from "./logger.js";

export interface CatchAndOptions<T> {
	logIf?: Predicate<unknown> | undefined;
	logger?: LogLike | undefined;
	message?: string | undefined;
	prefix?: string | undefined;
	rethrow?: boolean | undefined;
	rethrowIf?: Predicate<unknown> | undefined;
	returnSupplier?: ((err: unknown) => T) | undefined;
	returnValue?: T | undefined;
}

type CatchAndReturn<T, O extends CatchAndOptions<T>> = O extends { returnValue: infer U } ? U :
	O extends { returnSupplier: ((err: unknown) => infer U) } ? U :
		O extends { rethrow: true } ? never :
			undefined;

/**
 * Catch block builder to reduce the noise of thorough error handling.
 */
export const catchAnd = <T, O extends CatchAndOptions<T>>(options?: O) => (err: unknown): CatchAndReturn<T, O> => {
	const opt: O = options ?? {} as O;
	let message = opt.message;
	if (message == null && err instanceof Error) {
		message = (opt.prefix ?? "").concat(err.name, " ", err.message);
	} else {
		message ??= `Unknown error (${ typeof err })`;
	}
	if (opt.logger != null && (opt.logIf?.(err) ?? true)) {
		if (message != null) {
			opt.logger(message);
		}
	}
	if ("returnValue" in opt) {
		return opt.returnValue as CatchAndReturn<T, O>;
	}
	if (opt.returnSupplier != null) {
		return opt.returnSupplier(err) as CatchAndReturn<T, O>;
	}
	if ((opt.rethrow !== false && opt.rethrowIf == null) || opt.rethrowIf?.(err)) {
		throw err;
	}
	return undefined as CatchAndReturn<T, O>;
};
