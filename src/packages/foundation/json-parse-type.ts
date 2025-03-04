import type { JSONPrimitive } from "@rickosborne/typical";

export const JsonParseType = Object.freeze({
	Arr: "array",
	Item: "item",
	Obj: "object",
	Prop: "property",
	Root: "root",
} as const);

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

type JsonParseBeginEvent<S extends JsonParseState> = Omit<S, "length"> & {
	length: 0;
	transition: "begin";
};

type JsonParseEndEvent<S extends JsonParseState> = S & {
	transition: "end";
};

export type JsonParseState = JsonParseObjectState | JsonParseArrayState | JsonParseItemState | JsonParsePropertyState | JsonParseRootState;
export type JsonParseEvent = JsonParseBeginEvent<JsonParseState> | JsonParseEndEvent<JsonParseState>;
