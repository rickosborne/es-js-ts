/**
 * Given a record with some number of properties, fan out all permutations
 * of that record where exactly 1 property is possible, while the rest
 * are omitted.
 */
export type ExactlyOneOf<T extends object> = {
	[K in keyof T]: {
		[One in K]: T[One];
	} & {
		[Other in keyof T as Other extends K ? never: Other]?: never;
	}
}[keyof T];
