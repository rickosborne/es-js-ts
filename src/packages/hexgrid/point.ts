export interface Point {
	system: string;
}

export type Axis<P extends Point> = Exclude<keyof P, keyof Point>;
