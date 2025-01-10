export type Fruit = {
	count: number;
	readonly id: number;
	name: string;
	sweet?: boolean;
};

export type Vegetable = {
	count: bigint;
	id: number;
	name: string;
	tasty?: boolean;
}

export const f = <T>(): T => undefined as T;

export const someSymbol = Symbol("fixture");

export type Basics = {
	admin: boolean;
	readonly id: string;
	maybe?: boolean;
	name: string;
	nick?: string;
}
