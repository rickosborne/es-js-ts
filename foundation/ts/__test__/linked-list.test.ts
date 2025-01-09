import { describe, it } from "mocha";
import { assertDefined, hasOwn } from "@rickosborne/guard";
import { type DoubleLinkedList, type List, doubleLinkedList, singleLinkedList } from "../linked-list.js";
import { expect } from "chai";

const testType = <T>(
	list: List<T>,
	values: [T, T, T, T, T],
): void => {
	const [ a, b, c, d, e ] = values;
	const expectListToBe = (like: T[], extra = ""): void => {
		expect(list.length, `expectListToBe:length${extra}`).eq(like.length);
		expect(list.toArray(), `expectListToBe:toArray${extra}`).eql(like);
		expect(list.head, `expectListToBe:head${extra}`).eql(like[0]);
		if (hasOwn(list, "tail")) {
			expect(list.tail, `expectListToBe:tail${extra}`).eql(like[like.length - 1]);
		}
		expect(list.isEmpty, `expectListToBe:isEmpty${extra}`).eq(like.length === 0);
	};

	it("starts empty", () => {
		expectListToBe([]);
	});

	it("can unshift to front", () => {
		list.unshift(b);
		list.unshift(a);
		expectListToBe([ a, b ]);
	});

	it("can push to back", () => {
		list.push(d);
		list.push(e);
		expectListToBe([ a, b, d, e ]);
	});

	it("at+valuesAndIndexes", () => {
		let i = 0;
		const expected = [ a, b, d, e ];
		for (const [ value, index ] of list.valuesAndIndexes()) {
			expect(index, "index").eq(i);
			expect(value, `value@${index}`).eql(expected[index]);
			expect(list.at(index)).eql(value);
			i++;
		}
		expectListToBe(expected);
	});

	if ("reverseValues" in list && "reverseValuesAndIndexes" in list) {
		it("reverseValuesAndIndexes", () => {
			let i = 3;
			const expected = [ a, b, d, e ];
			for (const [ value, index ] of (list as DoubleLinkedList<T>).reverseValuesAndIndexes()) {
				expect(index, "index").eq(i);
				expect(value, `value@${index}`).eql(expected[index]);
				expect(list.at(index)).eql(value);
				i--;
			}
			expectListToBe(expected);
		});
	}

	it("insertAt", () => {
		list.insertAt(2, c);
		expectListToBe([ a, b, c, d, e ]);
	});

	it("can shift from front", () => {
		const first = list.shift();
		expect(first).eql(a);
		expectListToBe([ b, c, d, e ]);
		const second = list.shift();
		expect(second).eql(b);
		expectListToBe([ c, d, e ]);
	});

	it("walk", () => {
		let expectedIndex = 0;
		const expectedValues = [ c, d, e ];
		const expectedLists: T[][] = [
			[ c, d, e ],
			[ a, c, d, e ],
			[ a, c, d, b, e ],
		];
		list.walk((value, index) => {
			expect(index, "index").eq(expectedIndex);
			expectedIndex++;
			expect(value, "value").eql(expectedValues[index]);
			assertDefined(expectedLists[index], "expectedLists[index]");
			expectListToBe(expectedLists[index], `#${index}`);
			if (index === 0) {
				return { insertBefore: a, keepWalking: true };
			}
			if (index === 1) {
				return { insertAfter: b, keepWalking: true };
			}
			if (index === 2) {
				return { deleteItem: true, keepWalking: true };
			}
			throw new Error(`Unexpected call: ${index} ${JSON.stringify(value)}`);
		});
		expectListToBe([ a, c, d, b ]);
	});

	it("can pop from the back", () => {
		const last = list.pop();
		expect(last).eql(b);
		expectListToBe([ a, c, d ]);
		const penultimate = list.pop();
		expect(penultimate).eql(d);
		expectListToBe([ a, c ]);
	});
};

const testList = (
	fn: (<T>() => List<T>) & {name: string},
): void => {
	describe(fn.name, () => {
		describe("numbers", () => {
			testType<number>(
				fn(),
				[ 3, 4, 5, 6, 7 ],
			);
		});
		describe("strings", () => {
			testType<string>(
				fn(),
				[ "apple", "cherry", "durian", "eggplant", "fig" ],
			);
		});
	});
};

testList(singleLinkedList);

testList(doubleLinkedList);
