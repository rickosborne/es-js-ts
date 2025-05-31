import { memoizeBinary, memoizeUnary } from "@rickosborne/foundation";
import type { Point } from "./point.js";

export type HexReachable<P extends Point> = {
	direction?: undefined;
	distance: 0;
	point: P;
	prior?: undefined;
} | {
	direction: Readonly<P>;
	distance: Exclude<number, 0>;
	point: P;
	prior: P;
}

export const hexReachable = <P extends Point, Id extends string | number>(
	start: P,
	steps: number,
	directions: Readonly<Readonly<P>[]>,
	adder: (left: P, right: P) => P,
	identity: (point: P) => Id,
	isBlocked: (point: P, id: Id) => boolean,
	onPoint?: ((point: P, distance: number, prior: P, direction: Readonly<P>) => void) | undefined,
): HexReachable<P>[] => {
	const visited = new Set<Id>();
	visited.add(identity(start));
	const reachable: HexReachable<P>[] = [];
	reachable.push({ distance: 0, point: start });
	const fringes: P[][] = [];
	fringes.push([ start ]);
	const memoizedIsBlocked = memoizeBinary(isBlocked);
	const memoizedIdentity = memoizeUnary(identity);
	for (let distance = 1; distance <= steps; distance++) {
		const out: P[] = [];
		fringes.push(out);
		for (let prior of fringes[distance - 1]!) {
			for (let direction of directions) {
				const point = adder(prior, direction);
				const id = memoizedIdentity(point);
				if (!visited.has(id) && !memoizedIsBlocked(point, id)) {
					visited.add(id);
					out.push(point);
					reachable.push({ direction, distance, point, prior });
					if (onPoint != null) {
						onPoint(point, distance, prior, direction);
					}
				}
			}
		}
	}
	return reachable;
};
