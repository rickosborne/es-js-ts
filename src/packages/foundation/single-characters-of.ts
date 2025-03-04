import { isAsyncIterableLike, isIterableLike } from "@rickosborne/guard";

export type StringIterable = string | Iterable<string, undefined, undefined> | Iterator<string, undefined, undefined>;
export type AsyncStringIterable = StringIterable | AsyncIterable<string, undefined, undefined> | AsyncIterator<string, undefined, undefined>;

export function* singleCharactersOf(...its: StringIterable[]): Generator<string, void, unknown> {
	for (const it of its) {
		if (typeof it === "string") {
			for (const char of it) {
				yield char;
			}
		} else if (isIterableLike(it)) {
			for (const text of it) {
				for (const char of text) {
					yield char;
				}
			}
		} else {
			let more = true;
			while (more) {
				const result = it.next();
				if (result.done) {
					more = false;
				} else {
					for (const char of result.value) {
						yield char;
					}
				}
			}
		}
	}
}

export async function* singleCharactersOfAsync(...its: AsyncStringIterable[]): AsyncGenerator<string, void, unknown> {
	for (const it of its) {
		if (typeof it === "string") {
			for (const char of it) {
				yield char;
			}
		} else if (isIterableLike(it) || isAsyncIterableLike(it)) {
			for await (const text of it) {
				for (const char of text) {
					yield char;
				}
			}
		} else {
			let more = true;
			while (more) {
				const result = await it.next();
				if (result.done) {
					more = false;
				} else {
					for (const char of result.value) {
						yield char;
					}
				}
			}
		}
	}
}
