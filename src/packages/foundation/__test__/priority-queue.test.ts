import type { Comparator } from "@rickosborne/typical";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Queue } from "../queue.js";
import { arrayBinaryMaxHeap, arrayBinaryMinHeap } from "../binary-heap.js";
import { priorityArray, priorityLinkedList } from "../priority-queue.js";
import { skipList } from "../skip-list.js";

type Config = {
	reverse: boolean;
}

const testType = <T>(
	fn: ((_comparator: Comparator<T>) => Queue<T>) & { name: string },
	comparator: Comparator<T>,
	items: [ T, T, T, T, T ],
	config: Partial<Config>,
): void => {
	const queue = fn(comparator);
	const [ a, b, c, d, e ] = config.reverse ? items.reverse() as typeof items : items;

	const expectArrayToBe = (ins: T[], extra = ""): void => {
		expect(queue.length, `expectArrayToBe:length${ extra }`).eq(ins.length);
		expect(queue.toArray(), `expectArrayToBe:toArray${ extra }`).eql(ins);
		expect(queue.peek(), `expectArrayToBe:peek${ extra }`).eql(ins[0]);
	};

	it("starts empty", () => {
		expectArrayToBe([], "initial size");
		expect(queue.take()).eq(undefined);
	});

	it("adds 1", () => {
		queue.add(b);
		expectArrayToBe([ b ], "first");
	});

	it("adds 2", () => {
		queue.add(d);
		expectArrayToBe([ b, d ], "second");
	});

	it("ignores duplicates", () => {
		queue.add(b);
		expectArrayToBe([ b, d ], "dupe");
	});

	it("can add to end", () => {
		queue.add(e);
		expectArrayToBe([ b, d, e ], "add to end");
	});

	it("can add to mid", () => {
		queue.add(c);
		expectArrayToBe([ b, c, d, e ], "add to mid");
	});

	it("can add to head", () => {
		queue.add(a);
		expectArrayToBe([ a, b, c, d, e ], "add to head");
	});

	it("can take the first", () => {
		expect(queue.take(), `take ${ JSON.stringify(a) }`).eql(a);
		expectArrayToBe([ b, c, d, e ], "take");
	});

	it("can remove from the middle", () => {
		queue.remove(d);
		expectArrayToBe([ b, c, e ], "remove mid 1");
		queue.remove(c);
		expectArrayToBe([ b, e ], "remove mid 2");
	});

	it("can remove tail", () => {
		queue.remove(e);
		expectArrayToBe([ b ], "remove tail");
		queue.add(d);
		expectArrayToBe([ b, d ], "add after remove tail");
	});

	it("can remove head", () => {
		queue.remove(b);
		expectArrayToBe([ d ], "remove head 1");
		queue.remove(d);
		expectArrayToBe([], "remove head 2");
	});
};

const testQueue = (
	fn: <T>(comparator: Comparator<T>) => Queue<T>,
	config: Partial<Config> = {},
): void => {
	describe(fn.name, () => {
		describe("numbers ASC", () => {
			testType<number>(fn, (a, b) => a - b, [ 1, 2, 3, 4, 5 ], config);
		});
		describe("strings ASC", () => {
			testType<string>(fn, (a, b) => a.localeCompare(b), [ "apple", "cherry", "durian", "eggplant", "fig" ], config);
		});
		describe("strings DESC", () => {
			testType<string>(fn, (a, b) => b.localeCompare(a), [ "fig", "eggplant", "durian", "cherry", "apple" ], config);
		});
	});
};

testQueue(priorityArray);

testQueue(priorityLinkedList);

testQueue(arrayBinaryMinHeap);

testQueue(arrayBinaryMaxHeap, { reverse: true });

testQueue(skipList);
