import type { JSONPrimitive } from "@rickosborne/typical";
import { jsonPathAppend } from "./json-path-append.js";
import { type JsonToken, JsonTokenGenerator, JsonTokenType } from "./json-token-generator.js";
import { TokenGenerator } from "./token-generator.js";

export const JsonParseType = Object.freeze({
	Arr: "array",
	Item: "item",
	Obj: "object",
	Prop: "property",
	Root: "root",
} as const);

const { Arr, Item, Obj, Prop, Root } = JsonParseType;

export type JsonParseTypeT = (typeof JsonParseType)[keyof typeof JsonParseType];

export interface JsonParseStateBase {
	at: number;
	length: number;
	line: number;
	path: string;
	pos: number;
	type: JsonParseTypeT;
}

export interface JsonParseObjectState extends JsonParseStateBase {
	type: typeof JsonParseType.Obj;
}

export interface JsonParsePropertyState extends JsonParseStateBase {
	key: string;
	primitive?: JSONPrimitive | undefined;
	type: typeof JsonParseType.Prop;
}

export interface JsonParseArrayState extends JsonParseStateBase {
	count: number;
	type: typeof JsonParseType.Arr;
}

export interface JsonParseItemState extends JsonParseStateBase {
	index: number;
	primitive?: JSONPrimitive | undefined;
	type: typeof JsonParseType.Item;
}

export interface JsonParseRootState extends JsonParseStateBase {
	type: typeof JsonParseType.Root;
}

export const JsonParseTransition = Object.freeze({
	Begin: "begin",
	End: "end",
} as const);

const { Begin, End } = JsonParseTransition;

export type JsonParseTransitionT = (typeof JsonParseTransition)[keyof typeof JsonParseTransition];

export type JsonParseState = JsonParseObjectState | JsonParseArrayState | JsonParseItemState | JsonParsePropertyState | JsonParseRootState;
export type JsonParseEvent = JsonParseState & { transition: JsonParseTransitionT };

export class JsonParseObserver extends TokenGenerator<JsonParseEvent> {
	public static forIterator(iterator: AsyncIterator<string, undefined, undefined>): JsonParseObserver {
		return new JsonParseObserver(iterator);
	}

	private stack: JsonParseState[] = [];
	private readonly tokenGenerator: JsonTokenGenerator;
	private readonly tokenGeneratorIterator: AsyncIterator<JsonToken, undefined, undefined>;
	private waitingForToken = false;

	protected constructor(iterator: AsyncIterator<string, undefined, undefined>) {
		super(iterator);
		this.tokenGenerator = JsonTokenGenerator.forIterator(iterator);
		this.tokenGeneratorIterator = this.tokenGenerator[ Symbol.asyncIterator ]();
		this.stack.push({
			at: -1,
			length: 0,
			line: -1,
			pos: -1,
			path: "$",
			type: Root,
		} satisfies JsonParseRootState);
	}

	private addLength(length: number) {
		if (length === 0) {
			return;
		}
		this.stack.forEach((s) => s.length += length);
	}

	private beginState(state: JsonParseState): void {
		this.stack.push(state);
		this.onToken({ ...state, transition: Begin });
	}

	private endState(): void {
		const state = this.stack.pop();
		if (state == null) {
			throw new Error("Unexpected empty event/state stack");
		}
		this.onToken({ ...state, transition: End });
	}

	private onJsonToken(token: JsonToken): boolean {
		this.addLength(token.length);
		const top = this.stack.at(-1);
		if (top == null) {
			throw new Error("Stack is empty");
		}
		if (token.type === JsonTokenType.Pun) {
			if (token.value === "{") {
				this.beginState({
					at: token.at,
					length: token.length,
					line: token.line,
					path: top.path,
					pos: token.pos,
					type: Obj,
				} satisfies JsonParseObjectState);
			} else if (token.value === "}") {
				if (top.type !== Obj) {
					throw new Error(`Expected an object for '}', found ${ top.type }`);
				}
				this.endState();
			} else if (token.value === "[") {
				this.beginState({
					at: token.at,
					count: 0,
					length: token.length,
					line: token.line,
					path: top.path,
					pos: token.pos,
					type: Arr,
				} satisfies JsonParseArrayState);
			} else if (token.value === "]") {
				if (top.type !== Arr) {
					throw new Error(`Expected an array for ']', found ${ top.type }`);
				}
				this.endState();
			} else if (token.value === ",") {
				if (top.type === Prop || top.type === Item) {
					this.endState();
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
				this.beginState({
					at: token.at,
					key: token.value,
					length: token.length,
					line: token.line,
					path: jsonPathAppend(top.path, token.value),
					pos: token.pos,
					type: Prop,
				} satisfies JsonParsePropertyState);
			} else {
				throw new Error(`String expected for key/property name: ${ JSON.stringify(token) }`);
			}
		} else if (top.type === Arr) {
			const index = top.count++;
			this.beginState({
				at: token.at,
				path: top.path.concat(`[${ index }]`),
				index,
				length: token.length,
				line: token.line,
				pos: token.pos,
				primitive: token.value,
				type: Item,
			} satisfies JsonParseItemState);
			this.endState();
		} else if (top.type === Prop) {
			top.primitive = token.value;
			this.endState();
		} else {
			throw new Error(`Unknown token: ${ JSON.stringify(token) }`);
		}
		// Did the stack change?  That is, did any listeners get notified?
		return this.stack[ this.stack.length - 1 ] !== top;
	}

	public onThrow(reason?: unknown) {
		this.iteratorDone = true;
		this.multiIterator.onThrow(reason);
	}

	protected onWaiting(): void {
		if (this.waitingForToken) {
			return;
		}
		this.waitingForToken = true;
		this.tokenGeneratorIterator.next()
			.then((result) => {
				this.waitingForToken = false;
				if (result.done) {
					this.onDone();
				} else {
					const anyChanges = this.onJsonToken(result.value);
					if (!anyChanges) {
						setTimeout(() => this.onWaiting(), 1);
					}
				}
			})
			.catch((err: unknown) => {
				console.error(`[JsonParseObserver#onWaiting] catch`, err);
				this.onThrow(err);
				throw err;
			});
	}
}
