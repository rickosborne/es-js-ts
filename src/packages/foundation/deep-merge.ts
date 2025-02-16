import { isPlainObject } from "@rickosborne/guard";

/**
 * Given two types, recursively compare and merge them with the
 * following logic:
 * 1. If the two types are different, Winner wins.
 * 2. If either type is not a Record, Winner wins.
 * 3. If both types are Records, each property, in the set of
 *    all keys from both, is compared using the same logic. A
 *    superset Record is created.
 */
export type DeepMerge<Loser, Winner> = Winner extends object ? Loser extends object ? ({
	[K in keyof Loser as K extends keyof Winner ? never : K]: Loser[K];
} & {
	[K in keyof Winner as K]: K extends keyof Loser ? DeepMerge<Loser[K], Winner[K]> : Winner[K];
}) : Winner : Winner;

/**
 * @internal
 */
const isRecord = (value: unknown): value is Record<string | symbol, unknown> => isPlainObject(value);

/**
 * Recursively merge two values, if possible.
 * See {@link DeepMerge} for details on the logic.
 */
export const deepMerge = <Loser, Winner>(loser: Loser, winner: Winner): DeepMerge<Loser, Winner> => {
	const merge = (t: unknown, u: unknown): unknown => {
		if (t === u) return u;
		if (!isRecord(t) || !isRecord(u)) return u;
		const keySet = new Set<string | symbol>();
		Reflect.ownKeys(t).forEach((k) => keySet.add(k));
		const uKeys = new Set(Reflect.ownKeys(u));
		uKeys.forEach((k) => keySet.add(k));
		const result: Record<symbol | string, unknown> = {};
		for (const key of keySet) {
			const tValue = t[key];
			if (uKeys.has(key)) {
				const uValue = u[key];
				result[key] = merge(tValue, uValue);
			} else {
				result[key] = tValue;
			}
		}
		return result;
	};
	return merge(loser, winner) as DeepMerge<Loser, Winner>;
};
