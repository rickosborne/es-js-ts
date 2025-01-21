export interface LogLike {
	(message: string): void;
	(context: object, message?: string | undefined): void;
	(error: Error, message?: string | undefined): void;
}

export interface ConsoleLike {
	debug: LogLike;
	error: LogLike;
	info: LogLike;
	warn: LogLike;
}

export const isConsoleLike = (obj: unknown): obj is ConsoleLike => {
	return obj != null && typeof obj === "object"
		&& "debug" in obj && typeof obj.debug === "function"
		&& "error" in obj && typeof obj.error === "function"
		&& "info" in obj && typeof obj.info === "function"
		&& "warn" in obj && typeof obj.warn === "function";
};

export const findConsole = (): ConsoleLike => {
	if ("console" in globalThis && isConsoleLike(globalThis.console)) {
		return globalThis.console;
	}
	throw new Error("Unable to find a console");
};

export const con = findConsole();
