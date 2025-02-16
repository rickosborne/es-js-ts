/**
 * Recursively compare two objects for equivalence.
 * Warning: does not attempt to resolve cycles.
 */
export function deepEquals<T>(actual: unknown, expected: T): actual is T {
	const compare = (left: unknown, right: unknown): boolean => {
		if (left === right) return true;
		if (left == null || right == null) return left === right;
		if (typeof left !== typeof right) return false;
		if (typeof left !== "object" || typeof right !== "object") return false;
		if (Array.isArray(left)) {
			if (!Array.isArray(right) || left.length !== right.length) return false;
			return left.every((leftItem, index) => compare(leftItem, right[index]));
		}
		if (left instanceof Date) {
			return right instanceof Date && left.valueOf() === right.valueOf();
		}
		if (left.constructor !== right.constructor) return false;
		if (!compare(Object.getPrototypeOf(left), Object.getPrototypeOf(right))) return false;
		if (left instanceof Map) {
			if (!(right instanceof Map)) return false;
			const leftKeys = new Set(left.keys());
			const rightKeys = new Set(right.keys());
			if (!compare(leftKeys, rightKeys)) return false;
			for (const [ key, leftValue ] of left.entries()) {
				if (!compare(leftValue, right.get(key))) return false;
			}
			return true;
		}
		if (left instanceof Set) {
			if (!(right instanceof Set) || left.size !== right.size) return false;
			for (const value of left) {
				if (!right.has(value)) return false;
			}
			return true;
		}
		const leftKeys = Object.keys(left).sort();
		const rightKeys = Object.keys(right).sort();
		if (leftKeys.length !== rightKeys.length) return false;
		if (!leftKeys.every((key) => compare(Object.getOwnPropertyDescriptor(left, key), Object.getOwnPropertyDescriptor(right, key)))) return false;
		const leftSymbols = Object.getOwnPropertySymbols(left).sort();
		const rightSymbols = Object.getOwnPropertySymbols(right).sort();
		if (!compare(leftSymbols, rightSymbols)) return false;
		// noinspection RedundantIfStatementJS
		if (!leftSymbols.every((sym) => compare(Object.getOwnPropertyDescriptor(left, sym), Object.getOwnPropertyDescriptor(right, sym)))) return false;
		return true;
	};
	return compare(actual, expected);
}
