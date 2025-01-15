import { isInt } from "@rickosborne/guard";
import type { Either } from "@rickosborne/typical";
import { INFINITY_SIGIL, INT_SET_SIGIL, NEG_INFINITY_SIGIL, REAL_SET_SIGIL } from "./sigil.js";

export const BOUNDS = Symbol.for("bounds");

/**
 * Configuration for a bounded number greater than (exclusive) `N`.
 */
export interface BoundGT<N extends number> {
	gt: N;
}

/**
 * Configuration for a bounded number greater than or equal to (inclusive) `N`.
 */
export interface BoundGTE<N extends number> {
	gte: N;
}

/**
 * Configuration for a bounded number less than (exclusive) `N`.
 */
export interface BoundLT<N extends number> {
	lt: N
}

/**
 * Configuration for a bounded number less than or equal to (inclusive) `N`.
 */
export interface BoundLTE<N extends number> {
	lte: N
}

/**
 * Configuration for a bounded integer.
 */
export interface BoundInt {
	int: true
}

export interface BoundReal {
	int?: false
}

type BoundSpec<Low extends number, High extends number> = Either<BoundGT<Low>, BoundGTE<Low>> & Either<BoundLT<High>, BoundLTE<High>> & (BoundInt | { int?: never });

type BoundIntId<Spec> = Spec extends BoundInt ? "int" : "real";

type BoundLowerId<Spec> = Spec extends BoundGT<infer GT> ? `(${ GT }` : Spec extends BoundGTE<infer GTE> ? `[${ GTE }` : "(∞";

type BoundUpperId<Spec> = Spec extends BoundLT<infer LT> ? `${ LT })` : Spec extends BoundLTE<infer LTE> ? `${ LTE }]` : "∞)";

type BoundId<Spec> = `${ BoundLowerId<Spec> } ${ BoundIntId<Spec> } ${ BoundUpperId<Spec> }`

/**
 * Brand a number type with a type-generated explanation of its bounds,
 * so that it can only accept other numbers with the exact same bounds.
 */
export type BoundNumber<Spec extends object> = number & { [ BOUNDS ]: BoundId<Spec> };

type IntFromReal<Real> = Real extends BoundNumber<infer Spec> ? BoundNumber<Spec & BoundInt> : never;

export type Unbound<N> = N extends BoundNumber<infer _Spec> ? number : N;

export const real01Bounds = Object.freeze({ gte: 0, lte: 1 } as const);
type Real01Bounds = typeof real01Bounds;
/**
 * A real number in the range [0,1].
 */
export type Real01 = BoundNumber<Real01Bounds>

/**
 * Bounds spec for {@link Real255}.
 */
export const real255Bounds = Object.freeze({ gte: 0, lte: 255 } as const);
type Real255Bounds = typeof real255Bounds;
/**
 * A real number in the range [0,255].
 */
export type Real255 = BoundNumber<Real255Bounds>

/**
 * Bounds spec for {@link Int255}.
 */
export const int255Bounds = Object.freeze({ gte: 0, int: true, lte: 255 } as const);
type Int255Bounds = typeof int255Bounds;
/**
 * An integer in the range [0,255].
 */
export type Int255 = BoundNumber<Int255Bounds>;

const int360Bounds = Object.freeze({ gte: 0, int: true, lt: 360 } as const);
type Int360Bounds = typeof int360Bounds;
/**
 * An integer in the range [0,360).
 */
export type Int360 = BoundNumber<Int360Bounds>;

const real360Bounds = Object.freeze({ gte: 0, lt: 360 } as const);
type Real360Bounds = typeof real360Bounds;
/**
 * A number in the range [0,360).
 */
export type Real360 = BoundNumber<Real360Bounds>;

type BoundGuard<N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>> = {
	(value: unknown): value is N;
	bounds: Readonly<Spec>;
	range: string;
	typeName: string;
}

const rangeForBounds = (bounds: BoundSpec<number, number>): string => {
	const { gt, gte, int, lt, lte } = bounds;
	const s = (n: number | undefined): string => n === Infinity ? INFINITY_SIGIL : n === -Infinity ? NEG_INFINITY_SIGIL : n == null ? "?" : String(n);
	const lowValue = s(gt ?? gte);
	const highValue = s(lt ?? lte);
	if (lowValue === NEG_INFINITY_SIGIL && highValue === INFINITY_SIGIL) {
		return int === true ? INT_SET_SIGIL : REAL_SET_SIGIL;
	}
	const low = gt != null ? "(" : gte != null ? "[" : "<";
	const high = lt != null ? ")" : lte != null ? "]" : ">";
	return `${ low }${ lowValue },${ high }${ highValue }`;
};

/**
 * Generate a guard for the branded number type matching the given spec.
 */
export const guardForBounds = <N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>>(name: string, spec: Spec): BoundGuard<N, Spec> => {
	const { gt, gte, lt, lte, int } = spec;
	const guard = {
		[ name ]: (value: unknown): value is N => {
			return (typeof value === "number") &&
				!isNaN(value) &&
				(gt == null || value > gt) &&
				(gte == null || value >= gte) &&
				(lt == null || value < lt) &&
				(lte == null || value <= lte) &&
				(int !== true || isInt(value));
		},
	}[ name ] as BoundGuard<N, Spec>;
	guard.bounds = spec;
	guard.range = rangeForBounds(spec);
	guard.typeName = name;
	return guard;
};

type BoundAsserter<N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>> = {
	(value: unknown, name?: string | undefined): asserts value is N;
	bounds: Readonly<Spec>;
	range: string;
	typeName: string;
}

/**
 * Generate an asserter for the branded number type matching the given spec.
 */
export const asserterForBounds = <N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>>(
	guard: BoundGuard<N, Spec>,
): BoundAsserter<N, Spec> => {
	const { int } = guard.bounds;
	const baseMessage = `Should be ${ int === true ? "an integer" : "a number" } in the range ${ guard.range }`;
	const name = "assert".concat(guard.typeName);
	const asserter = {
		[ name ]: function (value: unknown, name?: string | undefined): asserts value is N {
			if (!guard(value)) {
				let message = baseMessage;
				if (name != null) {
					message = name.concat(": ", message);
				}
				if (typeof value === "number") {
					message = message.concat(": ", String(value));
				}
				throw new RangeError(message);
			}
			return value as unknown as void;
		},
	}[ name ] as BoundAsserter<N, Spec>;
	asserter.typeName = guard.typeName;
	asserter.range = guard.range;
	asserter.bounds = guard.bounds;
	return asserter;
};

export interface BoundUpgrader<N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>> {
	bounds: Readonly<Spec>;
	range: string;
	typeName: string;

	(value: number, name?: string): N;

	(value: number | undefined, name?: string): N | undefined;
}

export const upgraderForBounds = <N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>>(
	asserter: BoundAsserter<N, Spec>,
): BoundUpgrader<N, Spec> => {
	const name = "to".concat(asserter.typeName);
	const upgrader = {
		[ name ]: (value: unknown, name?: string | undefined): N | undefined => {
			if (value == null) {
				return undefined;
			}
			asserter(value, name);
			return value;
		},
	}[ name ] as BoundUpgrader<N, Spec>;
	upgrader.typeName = asserter.typeName;
	upgrader.range = asserter.range;
	upgrader.bounds = asserter.bounds;
	return upgrader;
};

type BoundGuardName<Name extends string> = `is${ Name }`;
type BoundAsserterName<Name extends string> = `assert${ Name }`;
type BoundUpgraderName<Name extends string> = `to${ Name }`;

type UtilsForBounded<N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>, Name extends string> = {
	[K in BoundGuardName<Name>]: BoundGuard<N, Spec>;
} & {
	[K in BoundAsserterName<Name>]: BoundAsserter<N, Spec>;
} & {
	[K in BoundUpgraderName<Name>]: BoundUpgrader<N, Spec>;
}

const utilsForBounds = <N extends BoundNumber<Spec>, Spec extends BoundSpec<number, number>, Name extends string>(typeName: Name, spec: Spec): UtilsForBounded<N, Spec, Name> => {
	const guard = guardForBounds<N, Spec>(typeName, spec);
	const asserter = asserterForBounds(guard);
	const upgrader = upgraderForBounds(asserter);
	return {
		[ `assert${ typeName }` ]: asserter,
		[ `is${ typeName }` ]: guard,
		[ `to${ typeName }` ]: upgrader,
	} as UtilsForBounded<N, Spec, Name>;
};

export const {
	assertInt255,
	isInt255,
	toInt255,
} = utilsForBounds<Int255, Int255Bounds, "Int255">("Int255", int255Bounds);

export const {
	assertReal255,
	isReal255,
	toReal255,
} = utilsForBounds<Real255, Real255Bounds, "Real255">("Real255", real255Bounds);

export const {
	assertInt360,
	isInt360,
	toInt360,
} = utilsForBounds<Int360, Int360Bounds, "Int360">("Int360", int360Bounds);

export const {
	assertReal360,
	isReal360,
	toReal360,
} = utilsForBounds<Real360, Real360Bounds, "Real360">("Real360", real360Bounds);

export const {
	assertReal01,
	isReal01,
	toReal01,
} = utilsForBounds<Real01, Real01Bounds, "Real01">("Real01", real01Bounds);

type ScalerForBounds<To extends BoundNumber<ToSpec>, ToSpec extends BoundSpec<0, ToHigh>, ToHigh extends number, From extends BoundNumber<FromSpec>, FromSpec extends BoundSpec<0, FromHigh>, FromHigh extends number> = {
	(value: From): To;
	(value: From | undefined): To | undefined;
	fromBounds: FromSpec;
	fromTypeName: string;
	toBounds: ToSpec;
	toTypeName: string;
};

export const scalerForBounds = <To extends BoundNumber<ToSpec>, ToSpec extends BoundSpec<0, ToHigh>, ToHigh extends number, From extends BoundNumber<FromSpec>, FromSpec extends BoundSpec<0, FromHigh>, FromHigh extends number>(
	fnName: string,
	toTypeName: string,
	toBounds: ToSpec,
	fromTypeName: string,
	fromBounds: FromSpec,
): ScalerForBounds<To, ToSpec, ToHigh, From, FromSpec, FromHigh> => {
	const fromHigh = fromBounds.lte ?? fromBounds.lt!;
	const toHigh = toBounds.lte ?? toBounds.lt!;
	const scale = toHigh / fromHigh;
	const { int } = toBounds;
	const scaler = {
		[fnName]: (value: From | undefined): To | undefined => {
			if (value == null) {
				return undefined;
			}
			let scaled = value * scale;
			if (int) {
				scaled = Math.round(scaled);
			}
			return scaled as To;
		},
	}[fnName]! as ScalerForBounds<To, ToSpec, ToHigh, From, FromSpec, FromHigh>;
	scaler.fromBounds = fromBounds;
	scaler.fromTypeName = fromTypeName;
	scaler.toTypeName = toTypeName;
	scaler.toBounds = toBounds;
	return scaler;
};

/**
 * Convert a {@link Real255} or {@link Int255} to a {@link Real01}.
 */
export const real01From255 = scalerForBounds<Real01, Real01Bounds, 1, Real255 | Int255, Real255Bounds | Int255Bounds, 255>("real01From255", "Real01", real01Bounds, "Real255", real255Bounds);

/**
 * Convert a {@link Real01} to an {@link Int255}.
 */
export const int255From01 = scalerForBounds<Int255, Int255Bounds, 255, Real01, Real01Bounds, 1>("int255From01", "Int255", int255Bounds, "Real01", real01Bounds);

/**
 * Convert a {@link Real01} to a {@link Real255}.
 */
export const real255From01 = scalerForBounds<Real255, Real255Bounds, 255, Real01, Real01Bounds, 1>("real255From01", "Real255", real255Bounds, "Real01", real01Bounds);

type Rounded<Real extends number, Int extends number> = Int extends IntFromReal<Real> ? Int : never;

export const roundBound = <Real extends number, Int extends number>(value: Real): Rounded<Real, Int> => {
	return (value == null ? undefined : Math.round(value)) as Rounded<Real, Int>;
};
