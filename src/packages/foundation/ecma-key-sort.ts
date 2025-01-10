import { A_GT_B, A_LT_B, type Comparator } from "@rickosborne/typical";

/**
 * Pattern for an array index key, basically any integer.
 */
export const INDEX_KEY_PATTERN = /^(?:0|[1-9]\d*)$/;

/**
 * Try to convert the string-format key into an array index key.
 */
export const asIndexKey = (key: string): number | undefined => {
	if (INDEX_KEY_PATTERN.test(key)) {
		return Number.parseInt(key);
	}
	return undefined;
};

/**
 * Comparator for Object keys in ECMA "correct" order.
 * Don't read the history on this.  It will only depress you.
 * @see {@link https://tc39.es/ecma262/#sec-ordinaryownpropertykeys | OrdinaryOwnPropertyKeys}
 */
export const ecmaKeySort: Comparator<string> = (a, b) => {
	const aIndex = asIndexKey(a);
	const bIndex = asIndexKey(b);
	if (aIndex != null && bIndex != null) {
		return aIndex - bIndex;
	}
	if (aIndex != null) {
		return A_LT_B;
	}
	if (bIndex != null) {
		return A_GT_B;
	}
	return a.localeCompare(b);
};
