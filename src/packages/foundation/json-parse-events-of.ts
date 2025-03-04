import { type JsonParseArrayState, type JsonParseEvent, type JsonParseItemState, type JsonParseObjectState, type JsonParsePropertyState, type JsonParseRootState, type JsonParseState, JsonParseTransition, JsonParseType } from "./json-parse-type.js";
import { JSON_PATH_ROOT, jsonPathAppend } from "./json-path-append.js";
import { type JsonToken, JsonTokenType } from "./json-token.js";
import { jsonTokensOf, jsonTokensOfAsync } from "./json-tokens-of.js";
import type { AsyncStringIterable, StringIterable } from "./single-characters-of.js";

const { Arr, Item, Obj, Prop, Root } = JsonParseType;

const { Begin, End } = JsonParseTransition;

export class JsonParseObserver {
	private stack: JsonParseState[] = [];

	private addLength(length: number) {
		if (length === 0) {
			return;
		}
		this.stack.forEach((s) => s.length += length);
	}

	private beginState(state: JsonParseState): JsonParseEvent {
		this.stack.push(state);
		return { ...state, length: 0, transition: Begin };
	}

	private endState(): JsonParseEvent {
		const state = this.stack.pop();
		if (state == null) {
			throw new Error("Unexpected empty event/state stack");
		}
		return { ...state, transition: End };
	}

	public onJsonToken(token: JsonToken | undefined): JsonParseEvent[] {
		if (token == null) {
			return this.stack
				.splice(0, this.stack.length)
				.map((state): JsonParseEvent => {
					return { ...state, transition: End };
				});
		}
		this.addLength(token.length);
		const events: JsonParseEvent[] = [];
		if (this.stack.length === 0) {
			events.push(this.beginState({
				at: token.at,
				length: 0,
				line: token.line,
				pos: token.pos,
				path: JSON_PATH_ROOT,
				type: Root,
			} satisfies JsonParseRootState));
		}
		const top = this.stack.at(-1)!;
		if (token.type === JsonTokenType.Pun) {
			if (token.value === "{") {
				events.push(this.beginState({
					at: token.at,
					length: 0,
					line: token.line,
					path: top.path,
					pos: token.pos,
					type: Obj,
				} satisfies JsonParseObjectState));
			} else if (token.value === "}") {
				if (top.type !== Obj) {
					throw new Error(`Expected an object for '}', found ${ top.type }`);
				}
				events.push(this.endState());
			} else if (token.value === "[") {
				return [ this.beginState({
					at: token.at,
					count: 0,
					length: 0,
					line: token.line,
					path: top.path,
					pos: token.pos,
					type: Arr,
				} satisfies JsonParseArrayState) ];
			} else if (token.value === "]") {
				if (top.type !== Arr) {
					throw new Error(`Expected an array for ']', found ${ top.type }`);
				}
				events.push(this.endState());
			} else if (token.value === ",") {
				if (top.type === Prop || top.type === Item) {
					events.push(this.endState());
				} else if (top.type !== Arr && top.type !== Obj) {
					throw new Error(`Expected an object or array for ',', found ${ top.type }`);
				}
			} else if (token.value === ":") {
				if (top.type !== Prop) {
					throw new Error(`Expected a property for ':', found ${ top.type }`);
				}
			} else {
				throw new Error(`Unknown punctuation: ${ JSON.stringify(token) }`);
			}
		} else if (token.type === JsonTokenType.Spc) {
			// do nothing
		} else if (top.type === Obj) {
			if (token.type === JsonTokenType.Str) {
				events.push(this.beginState({
					at: token.at,
					key: token.value,
					length: 0,
					line: token.line,
					path: jsonPathAppend(top.path, token.value),
					pos: token.pos,
					type: Prop,
				} satisfies JsonParsePropertyState));
			} else {
				throw new Error(`String expected for key/property name: ${ JSON.stringify(token) }`);
			}
		} else if (top.type === Arr) {
			const index = top.count++;
			events.push(this.beginState({
				at: token.at,
				path: jsonPathAppend(top.path, index),
				index,
				length: 0,
				line: token.line,
				pos: token.pos,
				primitive: token.value,
				type: Item,
			} satisfies JsonParseItemState));
			events.push(this.endState());
		} else if (top.type === Prop) {
			top.primitive = token.value;
			events.push(this.endState());
		} else {
			throw new Error(`Unknown token: ${ JSON.stringify(token) }`);
		}
		return events;
	}

}

export function* jsonParseEventsOf(...its: StringIterable[]): Generator<JsonParseEvent, void, undefined> {
	const parseObserver = new JsonParseObserver();
	for (const token of jsonTokensOf(...its)) {
		for (const event of parseObserver.onJsonToken(token)) {
			yield event;
		}
	}
	// Extract any remaining events
	for (const event of parseObserver.onJsonToken(undefined)) {
		yield event;
	}
}

export async function* jsonParseEventsOfAsync(...its: AsyncStringIterable[]): AsyncGenerator<JsonParseEvent, void, undefined> {
	const parseObserver = new JsonParseObserver();
	for await (const token of jsonTokensOfAsync(...its)) {
		for (const event of parseObserver.onJsonToken(token)) {
			yield event;
		}
	}
	// Extract any remaining events
	for (const event of parseObserver.onJsonToken(undefined)) {
		yield event;
	}
}
