export type Queue<T> = {
	add(value: T): void;
	peek(): T | undefined;
	remove(value: T): void;
	get length(): number;
	take(): T | undefined;
	toArray(): T[];
	values(): Generator<T, void, undefined>;
}
