/**
 * Type-level equality check.  I did not come up with this.
 * See {@link https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650 | this comment on the TypeScript issue} for the source.
 */
export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

/**
 * If the first two parameters, `X` and `Y`, are equal, return the third, `Z`.
 */
export type IfEquals<X, Y, Z> = Equals<X, Y> extends true ? Z : never;

/**
 * If the parameters are not equal, return the first.
 */
export type NotEquals<X, Y> = Equals<X, Y> extends true ? X : never;

/**
 * If the parameters are not the same, return the first.
 */
export type NotSame<X, Y> = X extends Y ? Y extends X ? never : X : never;
