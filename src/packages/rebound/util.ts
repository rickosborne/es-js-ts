import type { If } from "./guard-bounded.js";

export const ifIfPresent = <IfPresent extends boolean, T, U>(
	ifPresent: IfPresent,
	t: T,
	u: U,
): If<IfPresent, T, U> => {
	return (ifPresent ? t : u) as If<IfPresent, T, U>;
};
