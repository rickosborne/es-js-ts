import { scrubStackTrace } from "@rickosborne/guard";
import type { AnyFunction } from "@rickosborne/typical";
import { computeIfAbsent } from "../foundation/compute-if-absent.js";
import { type AssertExact, assertForBounds, type AssertIfPresent } from "./assert-bounded.js";
import { type GuardExact, guardForBounds, type GuardIfPresent } from "./guard-bounded.js";
import { rangeFromConfig } from "./range.js";
import { ReboundBuilder, type ReboundConfigBuilder } from "./rebound-builder.js";
import { type BoundedNumber, BOUNDS, type BoundsConfig, type BoundsLabel, type BoundsWithRange, INT_SET, LOWER_IN, type LowerInEx, type NumberSet, type OutOfBoundsErrorProvider, REAL_SET, type Rebounded, UPPER_IN, type UpperInEx } from "./spec.js";

export class Rebound<
	Range extends BoundsLabel<BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>,
	LowerInc extends LowerInEx,
	Lower extends number,
	Int extends NumberSet,
	Upper extends number,
	UpperInc extends UpperInEx,
> implements BoundsWithRange<Range, LowerInc, Lower, Int, Upper, UpperInc>, Rebounded<Range, LowerInc, Lower, Int, Upper, UpperInc> {
	public static buildType(typeName: string): ReboundConfigBuilder<LowerInEx, number, NumberSet, number, UpperInEx> {
		return new ReboundBuilder(
			{} as BoundsConfig<LowerInEx, number, NumberSet, number, UpperInEx>,
			<LowerInc extends LowerInEx, Lower extends number, Int extends NumberSet, Upper extends number, UpperInc extends UpperInEx, Config extends BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>>(
				config: Config,
			) => new Rebound<BoundsLabel<Config>, LowerInc, Lower, Int, Upper, UpperInc>(typeName, config));
	}

	private readonly fnCache = new Map<string, AnyFunction>();
	public readonly int: Int;
	public readonly isInt: boolean;
	public readonly isLowerInc: boolean;
	public readonly isReal: boolean;
	public readonly isUpperInc: boolean;
	public readonly lower: Lower;
	public readonly lowerInc: LowerInc;
	public readonly numberType: BoundedNumber<this> = NaN as BoundedNumber<this>;
	public readonly range: Range;
	public readonly upper: Upper;
	public readonly upperInc: UpperInc;

	protected constructor(
		public readonly typeName: string,
		config: BoundsConfig<LowerInc, Lower, Int, Upper, UpperInc>,
	) {
		this.int = config.int;
		this.upper = config.upper;
		this.lower = config.lower;
		this.lowerInc = config.lowerInc;
		this.upperInc = config.upperInc;
		this.range = rangeFromConfig(config) as Range;
		this.isInt = config.int === INT_SET;
		this.isReal = config.int === REAL_SET;
		this.isLowerInc = config.lowerInc === LOWER_IN;
		this.isUpperInc = config.upperInc === UPPER_IN;
	}

	public get assert(): AssertExact<BoundedNumber<this>> {
		return this.assertNamed(`assert${ this.typeName }`);
	}

	public get assertIfPresent(): AssertIfPresent<BoundedNumber<this>> {
		return this.assertIfPresentNamed(`assert${ this.typeName }IfPresent`);
	}

	public assertIfPresentNamed(fnName: string, errorProvider?: OutOfBoundsErrorProvider): AssertIfPresent<BoundedNumber<this>> {
		const buildError = errorProvider ?? ((v, n) => this.outOfRangeError(v, n));
		return this.cacheFn(`assertIfPresent:${fnName}:${errorProvider == null ? "Rebound outOfRangeError" : errorProvider.name}`, () => assertForBounds(this.guardIfPresent, buildError, true));
	}

	public assertNamed(fnName: string, errorProvider?: OutOfBoundsErrorProvider): AssertExact<BoundedNumber<this>> {
		const buildError = errorProvider ?? ((v, n) => this.outOfRangeError(v, n));
		return this.cacheFn(`assert:${ fnName }:${errorProvider == null ? "Rebound outOfRangeError" : errorProvider.name}`, () => assertForBounds(this.guard, buildError, false));
	}

	private cacheFn<F extends AnyFunction>(key: string, compute: () => F): F {
		return computeIfAbsent(key, this.fnCache as Map<string, F>, compute);
	}

	public get guard(): GuardExact<BoundedNumber<this>> {
		return this.guardNamed(`is${ this.typeName }`);
	};

	public get guardIfPresent(): GuardIfPresent<BoundedNumber<this>> {
		return this.guardIfPresentNamed(`is${ this.typeName }IfPresent`);
	};

	public guardIfPresentNamed(fnName: string): GuardIfPresent<BoundedNumber<this>> {
		return this.cacheFn(
			`guardIfPresent:${ fnName }`,
			() => guardForBounds(this, this.typeName, fnName, true),
		);
	}

	public guardNamed(fnName: string): GuardExact<BoundedNumber<this>> {
		return this.cacheFn(
			`guard:${ fnName }`,
			() => guardForBounds(this, this.typeName, fnName, false),
		);
	}

	public outOfRangeError(value: unknown, name?: string | undefined): RangeError {
		const type = value === null ? "null" : value === undefined ? "undefined" : typeof value;
		return scrubStackTrace(new RangeError(`Expected ${name == null ? "" : name.concat(" in ")}${ this.range }, actual: ${ type === "number" ? value as number : type }`), /at ((?:Rebound[.])?outOfRangeError|buildError)/);
	}

	public get [ BOUNDS ](): this {
		return this;
	}
}
